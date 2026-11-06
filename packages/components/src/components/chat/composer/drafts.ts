import type { ComposerDraft, ComposerError } from "../Composer.types";
import type {
  ComposerDraftAdapter,
  ComposerDraftContext,
  ComposerDraftController,
  ComposerDraftIncompatibility,
  ComposerDraftLoaded,
  ComposerDraftSaveResult,
  ComposerDraftSnapshot,
} from "../ComposerDraft.types";
import { readComposerDraft } from "./document";

function error(cause: unknown, code: string): ComposerError {
  return Object.freeze({
    code,
    message: cause instanceof Error ? cause.message : "Draft storage failed.",
  });
}

interface SaveJob {
  readonly draft: ComposerDraft;
  readonly abort: AbortController;
  readonly run: () => Promise<void>;
  readonly resolve: (result: ComposerDraftSaveResult) => void;
}

interface SaveLane {
  active?: SaveJob;
  queued?: SaveJob;
  readonly waiters: Set<() => void>;
}

// An adapter outlives its editor, so an ignored abort cannot let an old mount's
// write finish after a newer mount's write to the same host-supplied draft key.
const writers = new WeakMap<ComposerDraftAdapter, Map<string, SaveLane>>();

function storageKey(draft: ComposerDraft): string {
  return JSON.stringify([
    draft.scope.contextKey,
    draft.scope.conversationId,
    draft.draftKey,
  ]);
}

function enqueueSave(
  adapter: ComposerDraftAdapter,
  draft: ComposerDraft,
): Promise<ComposerDraftSaveResult> {
  let lanes = writers.get(adapter);
  if (!lanes) writers.set(adapter, (lanes = new Map()));
  const key = storageKey(draft);
  let lane = lanes.get(key);
  if (!lane) lanes.set(key, (lane = { waiters: new Set() }));
  const currentLane = lane;
  const currentLanes = lanes;

  function start(job: SaveJob): void {
    currentLane.active = job;
    void Promise.resolve()
      .then(job.run)
      .then(
        () =>
          job.resolve(Object.freeze({ outcome: "saved", draft: job.draft })),
        (cause: unknown) =>
          job.resolve(
            Object.freeze({
              outcome: "error",
              draft: job.draft,
              error: error(cause, "draft_save_failed"),
            }),
          ),
      )
      .then(() => {
        currentLane.active = undefined;
        const next = currentLane.queued;
        currentLane.queued = undefined;
        if (next) start(next);
        else {
          currentLanes.delete(key);
          for (const notify of [...currentLane.waiters]) notify();
          currentLane.waiters.clear();
        }
      });
  }

  return new Promise((resolve) => {
    const abort = new AbortController();
    const save = adapter.save;
    const job: SaveJob = {
      draft,
      abort,
      run: () => save.call(adapter, draft, abort.signal),
      resolve,
    };
    if (!currentLane.active) start(job);
    else {
      currentLane.queued?.abort.abort();
      currentLane.queued?.resolve(
        Object.freeze({
          outcome: "superseded",
          draft: currentLane.queued.draft,
        }),
      );
      currentLane.queued = job;
    }
  });
}

function waitForSaves(
  adapter: ComposerDraftAdapter,
  draft: ComposerDraft,
  signal: AbortSignal,
): Promise<void> {
  const lane = writers.get(adapter)?.get(storageKey(draft));
  if (!lane) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = () => {
      signal.removeEventListener("abort", cancel);
      lane.waiters.delete(finish);
      resolve();
    };
    const cancel = () => {
      lane.waiters.delete(finish);
      reject(new DOMException("Draft load aborted", "AbortError"));
    };
    if (signal.aborted) cancel();
    else {
      lane.waiters.add(finish);
      signal.addEventListener("abort", cancel, { once: true });
    }
  });
}

interface CurrentContext {
  readonly props: ComposerDraftContext;
  readonly draft: ComposerDraft;
  readonly identity: string;
  readonly fingerprint: string;
  readonly originId?: string;
}

function contextSnapshot(props: ComposerDraftContext): CurrentContext {
  if (
    !Number.isSafeInteger(props.instanceGeneration) ||
    props.instanceGeneration < 0
  )
    throw new TypeError(
      "Draft instanceGeneration must be a nonnegative safe integer",
    );
  const result = readComposerDraft(
    {
      draftVersion: 1,
      scope: props.scope,
      draftKey: props.draftKey,
      revision: props.revision,
      document: props.document,
      attachments: props.attachments ?? [],
    },
    { scope: props.scope, draftKey: props.draftKey },
  );
  if (result.status === "incompatible") throw new TypeError(result.reason);
  return {
    props: Object.freeze({
      ...props,
      scope: result.value.scope,
      document: result.value.document,
      attachments: result.value.attachments,
    }),
    draft: result.value,
    identity: JSON.stringify([
      storageKey(result.value),
      props.instanceGeneration,
    ]),
    fingerprint: JSON.stringify(result.value),
    originId: props.originId,
  };
}

class DraftController implements ComposerDraftController {
  private current: CurrentContext;
  private active = false;
  private ownerGeneration = 0;
  private editGeneration = 0;
  private loadGeneration = 0;
  private saveGeneration = 0;
  private loadAbort?: AbortController;
  private safety:
    "unloaded" | "compatible" | "incompatible" | "error" | "allowed" =
    "unloaded";
  private status: ComposerDraftSnapshot["status"] = "idle";
  private saving = false;
  private restorePending = false;
  private loaded?: ComposerDraftLoaded;
  private incompatible?: ComposerDraftIncompatibility;
  private failure?: ComposerError;
  private failureOperation?: ComposerDraftSnapshot["errorOperation"];
  private lastSavedRevision?: number;
  private readonly listeners = new Set<() => void>();
  private snapshot: ComposerDraftSnapshot;

  constructor(context: ComposerDraftContext) {
    this.current = contextSnapshot(context);
    this.snapshot = this.createSnapshot();
  }

  readonly getSnapshot = (): ComposerDraftSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  activate(): void {
    if (this.active) return;
    this.active = true;
    this.ownerGeneration++;
    void this.reload();
  }

  update(context: ComposerDraftContext): void {
    const next = contextSnapshot(context);
    const identityChanged =
      next.identity !== this.current.identity ||
      context.adapter !== this.current.props.adapter;
    const edited =
      next.fingerprint !== this.current.fingerprint ||
      next.originId !== this.current.originId;
    this.current = next;
    if (identityChanged) {
      this.ownerGeneration++;
      this.loadGeneration++;
      this.loadAbort?.abort();
      this.loadAbort = undefined;
      this.safety = "unloaded";
      this.status = "idle";
      this.saving = false;
      this.restorePending = false;
      this.loaded = undefined;
      this.incompatible = undefined;
      this.failure = undefined;
      this.failureOperation = undefined;
      this.lastSavedRevision = undefined;
      this.editGeneration++;
      if (this.active) void this.reload();
      else this.publish();
    } else if (edited) {
      this.editGeneration++;
      const restoring = this.restorePending;
      this.restorePending = false;
      if (this.failureOperation === "save") {
        this.failure = undefined;
        this.failureOperation = undefined;
        if (this.safety === "compatible" || this.safety === "allowed")
          this.status = "ready";
      }
      if (restoring || this.failureOperation === undefined) this.publish();
    }
  }

  async reload(): Promise<void> {
    if (!this.active) return;
    this.loadAbort?.abort();
    const abort = new AbortController();
    this.loadAbort = abort;
    const owner = this.ownerGeneration;
    const load = ++this.loadGeneration;
    const edit = this.editGeneration;
    const context = this.current;
    const adapter = context.props.adapter;
    const read = adapter.load;
    const isCurrent = () =>
      this.active &&
      this.ownerGeneration === owner &&
      this.loadGeneration === load &&
      !abort.signal.aborted;
    this.safety = "unloaded";
    this.status = "loading";
    this.restorePending = false;
    this.failure = undefined;
    this.failureOperation = undefined;
    this.publish();
    try {
      await waitForSaves(adapter, context.draft, abort.signal);
      if (!isCurrent()) return;
      const input = await read.call(adapter, {
        scope: context.draft.scope,
        draftKey: context.draft.draftKey,
        signal: abort.signal,
      });
      if (!isCurrent()) return;
      this.loadAbort = undefined;
      if (input === null || input === undefined) {
        this.safety = "compatible";
        this.status = "ready";
        this.incompatible = undefined;
        this.loaded = undefined;
        this.publish();
        return;
      }
      const result = readComposerDraft(input, {
        scope: context.draft.scope,
        draftKey: context.draft.draftKey,
      });
      const wrongScope =
        result.status === "compatible" &&
        (result.value.scope.contextKey !== context.draft.scope.contextKey ||
          result.value.scope.conversationId !==
            context.draft.scope.conversationId ||
          result.value.draftKey !== context.draft.draftKey);
      if (result.status === "incompatible" || wrongScope) {
        const reason =
          result.status === "incompatible"
            ? result.reason
            : "Stored draft belongs to a different scope or draft key.";
        this.safety = "incompatible";
        this.status = "incompatible";
        this.incompatible = Object.freeze({
          input,
          reason,
          scope: context.draft.scope,
          draftKey: context.draft.draftKey,
          instanceGeneration: context.props.instanceGeneration,
        });
        this.publish();
        this.failureOperation = "incompatible";
        this.current.props.onIncompatible?.(input, reason);
        if (!isCurrent()) return;
        this.failureOperation = undefined;
        return;
      }
      this.safety = "compatible";
      this.status = "ready";
      this.incompatible = undefined;
      const apply =
        this.editGeneration === edit && !!this.current.props.onRestore;
      this.loaded = Object.freeze({
        draft: result.value,
        migrated: result.migrated,
        applied: apply,
      });
      this.restorePending = apply;
      if (apply) {
        this.failureOperation = "restore";
        this.current.props.onRestore?.(result.value);
        if (!isCurrent()) return;
        this.failureOperation = undefined;
      }
      this.publish();
    } catch (cause) {
      if (!isCurrent()) return;
      this.loadAbort = undefined;
      this.safety = this.incompatible ? "incompatible" : "error";
      this.status = this.incompatible ? "incompatible" : "error";
      this.restorePending = false;
      this.failure = error(cause, "draft_load_failed");
      this.failureOperation ??= "load";
      this.publish();
    }
  }

  async save(): Promise<ComposerDraftSaveResult> {
    const blocked = !this.active
      ? "inactive"
      : this.safety === "unloaded"
        ? "loading"
        : this.safety === "incompatible"
          ? "incompatible"
          : this.safety === "error"
            ? "load_error"
            : this.restorePending
              ? "restoring"
              : undefined;
    if (blocked) return Object.freeze({ outcome: "blocked", reason: blocked });
    const context = this.current;
    const owner = this.ownerGeneration;
    const save = ++this.saveGeneration;
    this.saving = true;
    this.failure = undefined;
    this.failureOperation = undefined;
    this.status = "ready";
    this.publish();
    const result = await enqueueSave(context.props.adapter, context.draft);
    if (
      this.active &&
      this.ownerGeneration === owner &&
      this.saveGeneration === save
    ) {
      this.saving = false;
      if (result.outcome === "saved")
        this.lastSavedRevision = result.draft.revision;
      else if (result.outcome === "error") {
        this.failure = result.error;
        this.failureOperation = "save";
        if (this.snapshot.status !== "loading") this.status = "error";
      }
      this.publish();
    }
    return result;
  }

  allowOverwrite(incompatible: ComposerDraftIncompatibility): boolean {
    if (
      !this.active ||
      this.incompatible !== incompatible ||
      this.safety !== "incompatible"
    )
      return false;
    this.safety = "allowed";
    this.status = "ready";
    this.failure = undefined;
    this.failureOperation = undefined;
    this.publish();
    return true;
  }

  dispose(): void {
    this.active = false;
    this.ownerGeneration++;
    this.loadGeneration++;
    this.loadAbort?.abort();
    this.loadAbort = undefined;
    this.safety = "unloaded";
    this.status = "idle";
    this.saving = false;
    this.restorePending = false;
    this.snapshot = this.createSnapshot();
    this.listeners.clear();
  }

  private createSnapshot(): ComposerDraftSnapshot {
    return Object.freeze({
      status: this.status,
      scope: this.current.draft.scope,
      draftKey: this.current.draft.draftKey,
      instanceGeneration: this.current.props.instanceGeneration,
      saving: this.saving,
      restorePending: this.restorePending,
      overwriteAllowed: this.safety === "allowed",
      loaded: this.loaded,
      incompatible: this.incompatible,
      error: this.failure,
      errorOperation: this.failureOperation,
      lastSavedRevision: this.lastSavedRevision,
    });
  }

  private publish(): void {
    this.snapshot = this.createSnapshot();
    for (const listener of [...this.listeners]) listener();
  }
}

export function createComposerDraftController(
  context: ComposerDraftContext,
): ComposerDraftController {
  return new DraftController(context);
}
