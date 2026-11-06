import type {
  ComposerAttachmentEntry,
  ComposerAttachmentHandle,
  ComposerAttachmentMetadata,
  ComposerAttachmentState,
  ComposerDraftAttachment,
  ComposerError,
  ComposerScope,
  ComposerSendableAttachment,
} from "../Composer.types";
import type {
  ComposerAttachmentAdmission,
  ComposerAttachmentController,
  ComposerAttachmentIntakePolicy,
  ComposerAttachmentIntakeResult,
  ComposerAttachmentOptions,
  ComposerAttachmentRejection,
  ComposerAttachmentSnapshot,
  ComposerAttachmentSource,
} from "../ComposerAttachment.types";
import { readComposerDraft } from "./document";

function metadata(file: File): ComposerAttachmentMetadata {
  return Object.freeze({
    name: file.name,
    mediaType: file.type,
    size: file.size,
    lastModified: file.lastModified,
  });
}

function limit(value: number | undefined, name: string): void {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
    throw new TypeError(`${name} must be a nonnegative safe integer`);
}

function accepts(file: File, accept?: string): boolean {
  const types = (accept ?? "")
    .split(",")
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean);
  const mediaType = file.type.toLowerCase();
  return (
    types.length === 0 ||
    types.some((type) =>
      type === "*/*"
        ? true
        : type.startsWith(".")
          ? file.name.toLowerCase().endsWith(type)
          : type.endsWith("/*")
            ? mediaType.startsWith(type.slice(0, -1))
            : mediaType === type,
    )
  );
}

/** Shared validation for native pickers, file paste and drops, including legacy APIs. */
export function validateComposerAttachmentIntake(
  files: readonly File[],
  existingCount: number,
  policy: ComposerAttachmentIntakePolicy = {},
  source: ComposerAttachmentSource = "picker",
): ComposerAttachmentIntakeResult {
  limit(existingCount, "existingCount");
  limit(policy.maxFiles, "maxFiles");
  limit(policy.maxFileBytes, "maxFileBytes");
  const accepted: File[] = [];
  const rejected: ComposerAttachmentRejection[] = [];
  for (const file of files) {
    let error: ComposerError | undefined;
    if (!accepts(file, policy.accept))
      error = {
        code: "unsupported_type",
        message: "File type is not accepted.",
      };
    else if (
      policy.maxFileBytes !== undefined &&
      file.size > policy.maxFileBytes
    )
      error = {
        code: "file_too_large",
        message: "File exceeds the size limit.",
      };
    else if (
      policy.maxFiles !== undefined &&
      existingCount + accepted.length >= policy.maxFiles
    )
      error = { code: "too_many_files", message: "Attachment limit reached." };
    else error = policy.validate?.(file, source);
    if (error)
      rejected.push(
        Object.freeze({
          source,
          metadata: metadata(file),
          error: Object.freeze({ ...error }),
        }),
      );
    else accepted.push(file);
  }
  return Object.freeze({
    accepted: Object.freeze(accepted),
    rejected: Object.freeze(rejected),
  });
}

function copyScope(scope: ComposerScope): ComposerScope {
  if (!scope.contextKey || !scope.conversationId)
    throw new TypeError(
      "Attachment scope requires context and conversation IDs",
    );
  return Object.freeze({
    contextKey: scope.contextKey,
    conversationId: scope.conversationId,
  });
}

/** Reuse the portable draft validator for attachment handles and recovery metadata. */
function copyDraftAttachments(
  attachments: readonly ComposerDraftAttachment[],
  scope: ComposerScope,
): readonly ComposerDraftAttachment[] {
  const result = readComposerDraft(
    {
      draftVersion: 1,
      draftKey: "attachment-snapshot",
      revision: 0,
      scope,
      document: { schemaVersion: 1, content: [] },
      attachments,
    },
    { scope, draftKey: "attachment-snapshot" },
  );
  if (result.status === "incompatible") throw new TypeError(result.reason);
  return result.value.attachments;
}

interface LocalEntry {
  entry: ComposerAttachmentEntry;
  readonly file?: File;
  preview?: string;
  attempt?: { readonly token: symbol; readonly abort: AbortController };
}

let nextControllerId = 0;
const emptyRejections: readonly ComposerAttachmentRejection[] = Object.freeze(
  [],
);

class AttachmentController implements ComposerAttachmentController {
  private options: ComposerAttachmentOptions;
  private scope: ComposerScope;
  private draftKey?: string;
  private generation = 0;
  private readonly prefix =
    globalThis.crypto?.randomUUID?.() ??
    `attachment-${Date.now()}-${++nextControllerId}`;
  private nextId = 0;
  private readonly usedIds = new Set<string>();
  private readonly entries = new Map<string, LocalEntry>();
  private rejections: readonly ComposerAttachmentRejection[] = emptyRejections;
  private readonly listeners = new Set<() => void>();
  private snapshot: ComposerAttachmentSnapshot;
  private disposed = false;

  constructor(options: ComposerAttachmentOptions) {
    this.options = options;
    this.scope = copyScope(options.scope);
    this.draftKey = options.draftKey;
    this.snapshot = this.createSnapshot();
  }

  readonly getSnapshot = (): ComposerAttachmentSnapshot => this.snapshot;

  readonly subscribe = (listener: () => void): (() => void) => {
    if (this.disposed) return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  configure(options: ComposerAttachmentOptions): void {
    this.assertActive();
    const scope = copyScope(options.scope);
    const changed =
      this.scope.contextKey !== scope.contextKey ||
      this.scope.conversationId !== scope.conversationId ||
      this.draftKey !== options.draftKey;
    this.options = options;
    this.scope = scope;
    this.draftKey = options.draftKey;
    if (changed) this.clear();
  }

  setScope(scope: ComposerScope): void {
    this.assertActive();
    const next = copyScope(scope);
    if (
      this.scope.contextKey === next.contextKey &&
      this.scope.conversationId === next.conversationId
    )
      return;
    this.scope = next;
    this.clear();
  }

  intake(
    files: readonly File[],
    source: ComposerAttachmentSource,
  ): ComposerAttachmentAdmission {
    this.assertActive();
    const result = validateComposerAttachmentIntake(
      files,
      this.entries.size,
      this.options.policy,
      source,
    );
    const entryIds: string[] = [];
    for (const file of result.accepted) {
      let entryId: string;
      do {
        entryId = `${this.prefix}-${++this.nextId}`;
      } while (this.usedIds.has(entryId));
      this.usedIds.add(entryId);
      const local: LocalEntry = {
        entry: Object.freeze({
          entryId,
          metadata: metadata(file),
          state: Object.freeze({ status: "preparing" }),
        }),
        file,
      };
      this.entries.set(entryId, local);
      this.createPreview(local);
      entryIds.push(entryId);
    }
    this.rejections = Object.freeze([...this.rejections, ...result.rejected]);
    for (const entryId of entryIds)
      this.prepare(this.entries.get(entryId)!, false);
    this.publish();
    return Object.freeze({
      entryIds: Object.freeze(entryIds),
      rejected: result.rejected,
    });
  }

  remove(entryId: string): void {
    this.assertActive();
    const local = this.entries.get(entryId);
    if (!local) return;
    this.entries.delete(entryId);
    this.release(local);
    this.publish();
  }

  cancel(entryId: string): void {
    this.assertActive();
    const local = this.entries.get(entryId);
    if (!local?.attempt) return;
    this.release(local);
    this.update(local, { status: "cancelled" });
  }

  retry(entryId: string): boolean {
    this.assertActive();
    const local = this.entries.get(entryId);
    if (
      !local?.file ||
      (local.entry.state.status !== "error" &&
        local.entry.state.status !== "cancelled")
    )
      return false;
    this.createPreview(local);
    this.prepare(local);
    return true;
  }

  clearRejections(): void {
    this.assertActive();
    this.rejections = emptyRejections;
    this.publish();
  }

  restore(attachments: readonly ComposerDraftAttachment[]): void {
    this.assertActive();
    const restored = copyDraftAttachments(attachments, this.scope).map(
      (attachment): LocalEntry => ({
        entry: Object.freeze({
          entryId: attachment.entryId,
          metadata: attachment.metadata,
          state:
            attachment.status === "ready" &&
            this.options.canRecover?.(
              {
                entryId: attachment.entryId,
                metadata: attachment.metadata,
                handle: attachment.handle,
              },
              this.scope,
            ) === true
              ? Object.freeze({ status: "ready", handle: attachment.handle })
              : Object.freeze({ status: "reattach" }),
        }),
      }),
    );
    // Validate everything, including host recovery policy, before replacing local files.
    this.generation++;
    for (const local of this.entries.values()) this.release(local);
    this.entries.clear();
    for (const local of restored) {
      this.entries.set(local.entry.entryId, local);
      this.usedIds.add(local.entry.entryId);
    }
    this.rejections = emptyRejections;
    this.publish();
  }

  draftSnapshot(): readonly ComposerDraftAttachment[] {
    const attachments = Array.from(this.entries.values(), ({ entry }) => {
      const base = { entryId: entry.entryId, metadata: entry.metadata };
      return entry.state.status === "ready" &&
        this.options.canRecover?.(
          { ...base, handle: entry.state.handle },
          this.scope,
        ) === true
        ? { ...base, status: "ready" as const, handle: entry.state.handle }
        : { ...base, status: "reattach" as const };
    });
    return copyDraftAttachments(attachments, this.scope);
  }

  sendableSnapshot(): readonly ComposerSendableAttachment[] {
    return Object.freeze(
      Array.from(this.entries.values(), ({ entry }) => {
        if (entry.state.status !== "ready")
          throw new Error(
            "All selected attachments must be ready before submission",
          );
        return Object.freeze({
          entryId: entry.entryId,
          metadata: entry.metadata,
          handle: entry.state.handle,
        });
      }),
    );
  }

  file(entryId: string): File | undefined {
    return this.entries.get(entryId)?.file;
  }

  previewUrl(entryId: string): string | undefined {
    return this.entries.get(entryId)?.preview;
  }

  clear(): void {
    this.assertActive();
    this.generation++;
    for (const local of this.entries.values()) this.release(local);
    this.entries.clear();
    this.rejections = emptyRejections;
    this.publish();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    for (const local of this.entries.values()) this.release(local);
    this.entries.clear();
    this.rejections = emptyRejections;
    this.snapshot = this.createSnapshot();
    const listeners = [...this.listeners];
    this.listeners.clear();
    for (const listener of listeners) listener();
  }

  private assertActive(): void {
    if (this.disposed) throw new Error("Attachment controller is disposed");
  }

  private createSnapshot(): ComposerAttachmentSnapshot {
    return Object.freeze({
      scope: this.scope,
      draftKey: this.draftKey,
      generation: this.generation,
      entries: Object.freeze(
        Array.from(this.entries.values(), ({ entry }) => entry),
      ),
      rejections: this.rejections,
    });
  }

  private publish(): void {
    this.snapshot = this.createSnapshot();
    for (const listener of [...this.listeners]) listener();
  }

  private update(local: LocalEntry, state: ComposerAttachmentState): void {
    local.entry = Object.freeze({
      ...local.entry,
      state: Object.freeze(state),
    });
    this.publish();
  }

  private createPreview(local: LocalEntry): void {
    if (
      local.preview !== undefined ||
      !local.file?.type.startsWith("image/") ||
      typeof URL.createObjectURL !== "function"
    )
      return;
    local.preview = URL.createObjectURL(local.file);
  }

  private release(local: LocalEntry): void {
    const attempt = local.attempt;
    local.attempt = undefined;
    attempt?.abort.abort();
    if (local.preview !== undefined) {
      URL.revokeObjectURL(local.preview);
      local.preview = undefined;
    }
  }

  private prepare(local: LocalEntry, notify = true): void {
    const generation = this.generation;
    const scope = this.scope;
    const token = Symbol();
    const abort = new AbortController();
    const prepare = this.options.prepare;
    local.attempt = { token, abort };
    const isCurrent = () =>
      !this.disposed &&
      this.generation === generation &&
      this.entries.get(local.entry.entryId) === local &&
      local.attempt?.token === token &&
      !abort.signal.aborted;
    if (notify) this.update(local, { status: "preparing" });
    void Promise.resolve()
      .then(() => {
        if (!isCurrent()) return;
        return prepare(local.file!, {
          entryId: local.entry.entryId,
          scope,
          signal: abort.signal,
          reportProgress: (progress) => {
            if (!isCurrent() || !Number.isFinite(progress)) return;
            this.update(local, {
              status: "uploading",
              progress: Math.max(0, Math.min(1, progress)),
            });
          },
        });
      })
      .then((handle: ComposerAttachmentHandle | undefined) => {
        if (!isCurrent()) return;
        const attachment = copyDraftAttachments(
          [
            {
              entryId: local.entry.entryId,
              metadata: local.entry.metadata,
              status: "ready",
              handle: handle!,
            },
          ],
          scope,
        )[0];
        if (attachment.status !== "ready") return;
        local.attempt = undefined;
        this.update(local, { status: "ready", handle: attachment.handle });
      })
      .catch((cause: unknown) => {
        if (!isCurrent()) return;
        local.attempt = undefined;
        this.update(local, {
          status: "error",
          error: Object.freeze({
            code: "preparation_failed",
            message:
              cause instanceof Error
                ? cause.message
                : "Unable to prepare attachment.",
          }),
        });
      });
  }
}

export function createComposerAttachmentController(
  options: ComposerAttachmentOptions,
): ComposerAttachmentController {
  return new AttachmentController(options);
}
