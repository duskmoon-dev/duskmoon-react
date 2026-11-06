import type {
  ComposerError,
  ComposerProviderCandidate,
  ComposerProviderRequest,
} from "../Composer.types";
import type {
  ComposerCompletionProvider,
  ComposerProviderBreadcrumb,
  ComposerProviderContext,
  ComposerProviderGroup,
  ComposerProviderItem,
  ComposerProviderSelectionEffect,
  ComposerProviderSnapshot,
} from "../ComposerProvider.types";
import { snapshotComposerDocument, snapshotComposerJson } from "./document";

type Trigger = ComposerProviderRequest["trigger"];
type Input = ComposerProviderContext & { readonly signature: string };
let nextController = 0;

export function composerProviderItemId(
  providerId: string,
  candidateId: string,
) {
  return `provider:${encodeURIComponent(providerId)}:${encodeURIComponent(candidateId)}`;
}

/** Detect only editable text; atomic nodes and claimed commands stay adapter-owned. */
export function matchComposerProviderTrigger(
  context: ComposerProviderContext,
  provider: ComposerCompletionProvider,
): Trigger | undefined {
  const selection = context.selection;
  if (!selection || selection.start !== selection.end) return;
  const node = context.document.content[selection.nodeIndex];
  if (
    node?.type !== "text" ||
    !Number.isSafeInteger(selection.start) ||
    selection.start < 0 ||
    selection.start > node.text.length ||
    !provider.trigger.text ||
    /\s/u.test(provider.trigger.text)
  )
    return;
  const prefix = node.text.slice(0, selection.start);
  const marker = provider.trigger.text;
  const start =
    provider.trigger.position === "leading" ? 0 : prefix.search(/\S*$/u);
  if (!prefix.startsWith(marker, start)) return;
  if (provider.trigger.position === "leading") {
    if (selection.nodeIndex !== 0 || start !== 0 || context.document.command)
      return;
  } else if (start > 0 && !/\s/u.test(prefix[start - 1])) return;
  const query = prefix.slice(start + marker.length);
  if (/\s/u.test(query)) return;
  return Object.freeze({
    text: prefix.slice(start),
    nodeIndex: selection.nodeIndex,
    start,
    end: selection.start,
    caret: selection.start,
  });
}

function sameRequest(a: ComposerProviderRequest, b: ComposerProviderRequest) {
  return (
    a.requestId === b.requestId &&
    a.providerId === b.providerId &&
    a.scope.contextKey === b.scope.contextKey &&
    a.scope.conversationId === b.scope.conversationId &&
    a.documentRevision === b.documentRevision &&
    a.instanceGeneration === b.instanceGeneration &&
    a.query === b.query &&
    a.trigger.text === b.trigger.text &&
    a.trigger.nodeIndex === b.trigger.nodeIndex &&
    a.trigger.start === b.trigger.start &&
    a.trigger.end === b.trigger.end &&
    a.trigger.caret === b.trigger.caret
  );
}

function sameProviders(
  previous: readonly ComposerCompletionProvider[],
  next: readonly ComposerCompletionProvider[],
) {
  return (
    previous.length === next.length &&
    previous.every((provider, index) => {
      const other = next[index];
      return (
        provider.providerId === other.providerId &&
        provider.label === other.label &&
        provider.query === other.query &&
        provider.trigger.text === other.trigger.text &&
        provider.trigger.position === other.trigger.position
      );
    })
  );
}

function inputSnapshot(context: ComposerProviderContext): Input {
  const document = snapshotComposerDocument(context.document);
  if (
    !Number.isSafeInteger(context.documentRevision) ||
    context.documentRevision < 0 ||
    !Number.isSafeInteger(context.instanceGeneration) ||
    context.instanceGeneration < 0
  )
    throw new TypeError(
      "Provider revisions and generations must be nonnegative integers",
    );
  const providers = context.providers.map((provider) =>
    Object.freeze({
      ...provider,
      trigger: Object.freeze({ ...provider.trigger }),
    }),
  );
  if (
    new Set(providers.map((provider) => provider.providerId)).size !==
      providers.length ||
    providers.some((provider) => !provider.providerId)
  )
    throw new TypeError(
      "Suggestion providers require unique, nonempty identities",
    );
  const scope = Object.freeze({ ...context.scope });
  const selection = context.selection
    ? Object.freeze({ ...context.selection })
    : null;
  return {
    ...context,
    document,
    scope,
    selection,
    providers,
    signature: JSON.stringify([
      document,
      context.documentRevision,
      scope.contextKey,
      scope.conversationId,
      context.instanceGeneration,
      selection,
    ]),
  };
}

function errorDetails(cause: unknown): ComposerError {
  return Object.freeze({
    code: "provider_error",
    message:
      cause instanceof Error ? cause.message : "Unable to load suggestions.",
  });
}

function candidateSnapshot(candidate: ComposerProviderCandidate) {
  if (
    typeof candidate.id !== "string" ||
    !candidate.id ||
    typeof candidate.label !== "string" ||
    [candidate.description, candidate.group, candidate.disabledReason].some(
      (value) => value !== undefined && typeof value !== "string",
    )
  )
    throw new TypeError("Suggestion candidates require an identity and label");
  const action = candidate.action;
  if (action.type === "insert") {
    const document = snapshotComposerDocument({
      schemaVersion: 1,
      content: action.content,
      ...(action.command ? { command: action.command } : {}),
    });
    return Object.freeze({
      ...candidate,
      action: Object.freeze({
        type: "insert" as const,
        content: document.content,
        ...(document.command ? { command: document.command } : {}),
      }),
    });
  }
  if (action.type === "drill") {
    if (typeof action.refId !== "string" || !action.refId)
      throw new TypeError("Directory candidates require a refId");
  } else if (action.type === "invoke") {
    const document = snapshotComposerDocument({
      schemaVersion: 1,
      content: [],
      command: action.command,
    });
    return Object.freeze({
      ...candidate,
      action: Object.freeze({
        type: "invoke" as const,
        command: document.command!,
        ...(action.arguments !== undefined
          ? { arguments: snapshotComposerJson(action.arguments) }
          : {}),
      }),
    });
  } else throw new TypeError("Unsupported suggestion action");
  return Object.freeze({ ...candidate, action: Object.freeze({ ...action }) });
}

const idleSnapshot = (): ComposerProviderSnapshot =>
  Object.freeze({
    status: "idle",
    groups: Object.freeze([]),
    items: Object.freeze([]),
    breadcrumbs: Object.freeze([]),
  });

/** Scope-safe request bookkeeping; contains no editor state or submission behavior. */
export class ComposerProviderController {
  private readonly prefix = `composer-provider-${++nextController}`;
  private requestSequence = 0;
  private generation = 0;
  private input?: Input;
  private disposed = false;
  private dismissed = false;
  private navigationProvider?: string;
  private breadcrumbs: readonly ComposerProviderBreadcrumb[] = [];
  private preferredActiveId?: string;
  private readonly requests = new Map<string, AbortController>();
  private readonly listeners = new Set<() => void>();
  private snapshot = idleSnapshot();

  readonly getSnapshot = () => this.snapshot;
  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** React StrictMode may reconnect a disposed effect without reusing old work. */
  activate() {
    this.disposed = false;
  }

  update(context: ComposerProviderContext) {
    if (this.disposed) return;
    let input: Input;
    try {
      input = inputSnapshot(context);
    } catch (cause) {
      this.cancel();
      this.input = undefined;
      const error = errorDetails(cause);
      if (
        this.snapshot.status !== "error" ||
        this.snapshot.groups.length > 0 ||
        this.snapshot.error?.message !== error.message
      )
        this.publish([], error);
      return;
    }
    if (
      this.input?.signature === input.signature &&
      sameProviders(this.input.providers, input.providers)
    ) {
      const availabilityChanged =
        this.input.candidateDisabledReason !== input.candidateDisabledReason;
      this.input = input;
      if (availabilityChanged) this.publish(this.snapshot.groups);
      return;
    }
    this.input = input;
    this.dismissed = false;
    this.navigationProvider = undefined;
    this.breadcrumbs = [];
    this.preferredActiveId = undefined;
    this.query();
  }

  dismiss() {
    if (this.disposed) return;
    this.cancel();
    this.dismissed = true;
    this.publish([]);
  }

  retry() {
    if (this.disposed || !this.input) return;
    this.dismissed = false;
    this.query();
  }

  /** A depth of zero returns to all matching providers; default goes up one folder. */
  back(depth = this.breadcrumbs.length - 1) {
    if (this.disposed || !this.input || depth < 0 || !Number.isInteger(depth))
      return;
    if (depth >= this.breadcrumbs.length) return;
    this.breadcrumbs = this.breadcrumbs.slice(0, depth);
    if (depth === 0) this.navigationProvider = undefined;
    this.preferredActiveId = undefined;
    this.query();
  }

  move(direction: 1 | -1) {
    const enabled = this.snapshot.items.filter(
      (item) => this.disabledReason(item) === undefined,
    );
    if (this.disposed || enabled.length === 0) return;
    const index = enabled.findIndex(
      (item) => item.id === this.snapshot.activeId,
    );
    this.preferredActiveId =
      enabled[(index + direction + enabled.length) % enabled.length].id;
    this.publish(this.snapshot.groups);
  }

  /** Current adapter state can be supplied to close a just-invalidated selection race. */
  select(
    itemId = this.snapshot.activeId,
    current?: ComposerProviderContext,
  ): ComposerProviderSelectionEffect | undefined {
    if (current) this.update(current);
    if (this.disposed || !itemId || !this.input || this.dismissed) return;
    const item = this.snapshot.items.find(
      (candidate) => candidate.id === itemId,
    );
    if (!item || this.disabledReason(item) !== undefined) return;
    const provider = this.input.providers.find(
      (candidate) => candidate.providerId === item.providerId,
    );
    const trigger =
      provider && matchComposerProviderTrigger(this.input, provider);
    if (
      !provider ||
      !trigger ||
      !sameRequest(item.request, {
        ...item.request,
        scope: this.input.scope,
        instanceGeneration: this.input.instanceGeneration,
        documentRevision: this.input.documentRevision,
        query: trigger.text.slice(provider.trigger.text.length),
        trigger,
      })
    )
      return;
    const effect = Object.freeze({
      itemId: item.id,
      request: item.request,
      candidate: item.candidate,
      action: item.candidate.action,
    });
    if (effect.action.type === "drill") {
      this.navigationProvider = item.providerId;
      this.breadcrumbs = [
        ...this.breadcrumbs,
        Object.freeze({
          refId: effect.action.refId,
          label: item.candidate.label,
        }),
      ];
      this.preferredActiveId = undefined;
      this.query();
    } else this.dismiss();
    return effect;
  }

  dispose() {
    this.cancel();
    this.disposed = true;
    this.input = undefined;
    this.breadcrumbs = [];
    this.navigationProvider = undefined;
    this.preferredActiveId = undefined;
    this.snapshot = idleSnapshot();
    this.listeners.clear();
  }

  private cancel() {
    this.generation++;
    for (const controller of this.requests.values()) controller.abort();
    this.requests.clear();
  }

  private disabledReason(item: ComposerProviderItem) {
    return (
      item.candidate.disabledReason ??
      this.input?.candidateDisabledReason?.(item.candidate)
    );
  }

  private publish(
    groups: readonly ComposerProviderGroup[],
    error?: ComposerError,
  ) {
    const items = Object.freeze(groups.flatMap((group) => group.items));
    const enabled = items.filter(
      (item) => this.disabledReason(item) === undefined,
    );
    const active =
      enabled.find((item) => item.id === this.preferredActiveId) ?? enabled[0];
    if (active) this.preferredActiveId = active.id;
    const status = error
      ? "error"
      : groups.some((group) => group.status === "loading")
        ? "loading"
        : items.length
          ? "ready"
          : groups.some((group) => group.status === "error")
            ? "error"
            : groups.length
              ? "empty"
              : "idle";
    this.snapshot = Object.freeze({
      status,
      groups: Object.freeze([...groups]),
      items,
      activeId: active?.id,
      breadcrumbs: Object.freeze([...this.breadcrumbs]),
      ...(error ? { error } : {}),
    });
    for (const listener of this.listeners) listener();
  }

  private query() {
    this.cancel();
    const input = this.input;
    if (!input || this.disposed || this.dismissed) return;
    const generation = this.generation;
    const matches = input.providers.flatMap((provider) => {
      if (
        this.navigationProvider &&
        provider.providerId !== this.navigationProvider
      )
        return [];
      const trigger = matchComposerProviderTrigger(input, provider);
      return trigger ? [{ provider, trigger }] : [];
    });
    const groups = matches.map(
      ({ provider, trigger }): ComposerProviderGroup => {
        const request: ComposerProviderRequest = Object.freeze({
          requestId: `${this.prefix}-${++this.requestSequence}`,
          providerId: provider.providerId,
          scope: input.scope,
          instanceGeneration: input.instanceGeneration,
          documentRevision: input.documentRevision,
          query: trigger.text.slice(provider.trigger.text.length),
          trigger,
        });
        return Object.freeze({
          providerId: provider.providerId,
          label: provider.label ?? provider.providerId,
          status: "loading",
          items: Object.freeze([]),
          request,
        });
      },
    );
    this.publish(groups);
    for (let index = 0; index < matches.length; index++) {
      const { provider } = matches[index];
      const group = groups[index];
      const controller = new AbortController();
      this.requests.set(provider.providerId, controller);
      const navigation = Object.freeze({
        breadcrumbs: Object.freeze([...this.breadcrumbs]),
        ...(this.breadcrumbs.length
          ? { refId: this.breadcrumbs.at(-1)!.refId }
          : {}),
      });
      const isCurrent = () =>
        !this.disposed &&
        generation === this.generation &&
        this.requests.get(provider.providerId) === controller &&
        !controller.signal.aborted;
      const resolve = async () => {
        try {
          const result = await provider.query(
            group.request,
            controller.signal,
            navigation,
          );
          if (!isCurrent()) return;
          if (!sameRequest(group.request, result.request))
            throw new TypeError(
              "Provider returned a result for a different request",
            );
          const identities = new Set<string>();
          const items = result.candidates.map(
            (candidate): ComposerProviderItem => {
              const snapshot = candidateSnapshot(candidate);
              if (identities.has(snapshot.id))
                throw new TypeError("Duplicate suggestion identity");
              identities.add(snapshot.id);
              return Object.freeze({
                id: composerProviderItemId(provider.providerId, snapshot.id),
                providerId: provider.providerId,
                candidate: snapshot,
                request: group.request,
              });
            },
          );
          this.replaceGroup(provider.providerId, {
            ...group,
            status: items.length ? "ready" : "empty",
            items: Object.freeze(items),
          });
        } catch (cause) {
          if (isCurrent())
            this.replaceGroup(provider.providerId, {
              ...group,
              status: "error",
              items: Object.freeze([]),
              error: errorDetails(cause),
            });
        } finally {
          if (isCurrent()) this.requests.delete(provider.providerId);
        }
      };
      void resolve();
    }
  }

  private replaceGroup(providerId: string, group: ComposerProviderGroup) {
    this.publish(
      this.snapshot.groups.map((previous) =>
        previous.providerId === providerId ? Object.freeze(group) : previous,
      ),
    );
  }
}
