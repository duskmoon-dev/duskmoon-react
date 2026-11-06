import type {
  ComposerAttachmentEntry,
  ComposerAttachmentHandle,
  ComposerAttachmentMetadata,
  ComposerDraftAttachment,
  ComposerError,
  ComposerScope,
  ComposerSendableAttachment,
} from "./Composer.types";

export type ComposerAttachmentSource = "picker" | "paste" | "drop";

/** The same policy is applied to every intake path; it never consumes paste text. */
export interface ComposerAttachmentIntakePolicy {
  /** Native accept syntax: comma-separated MIME types, wildcards or extensions. */
  readonly accept?: string;
  readonly maxFiles?: number;
  readonly maxFileBytes?: number;
  readonly validate?: (
    file: File,
    source: ComposerAttachmentSource,
  ) => ComposerError | undefined;
}

export interface ComposerAttachmentRejection {
  readonly source: ComposerAttachmentSource;
  readonly metadata: ComposerAttachmentMetadata;
  readonly error: ComposerError;
}

/** Runtime intake result. Only the accepted list contains local File handles. */
export interface ComposerAttachmentIntakeResult {
  readonly accepted: readonly File[];
  readonly rejected: readonly ComposerAttachmentRejection[];
}

export interface ComposerAttachmentPreparationContext {
  readonly entryId: string;
  readonly scope: ComposerScope;
  readonly signal: AbortSignal;
  /** Reports upload progress from 0 to 1; obsolete calls are ignored. */
  readonly reportProgress: (progress: number) => void;
}

export interface ComposerAttachmentOptions {
  readonly scope: ComposerScope;
  /** Optional draft ownership within a scope; changing it releases local files. */
  readonly draftKey?: string;
  readonly policy?: ComposerAttachmentIntakePolicy;
  /** Hosts validate/prepare/upload and issue a portable sendable handle. */
  readonly prepare: (
    file: File,
    context: ComposerAttachmentPreparationContext,
  ) => ComposerAttachmentHandle | Promise<ComposerAttachmentHandle>;
  /**
   * Explicit host policy for handles usable after draft recovery. Without this,
   * every saved/restored occurrence requires reattachment. This is not server
   * authorization or a guarantee that a later submission will be admitted.
   */
  readonly canRecover?: (
    attachment: ComposerSendableAttachment,
    scope: ComposerScope,
  ) => boolean;
}

export interface ComposerAttachmentSnapshot {
  readonly scope: ComposerScope;
  readonly draftKey?: string;
  readonly generation: number;
  readonly entries: readonly ComposerAttachmentEntry[];
  /** Rejections stay visible until explicitly dismissed or the scope changes. */
  readonly rejections: readonly ComposerAttachmentRejection[];
}

export interface ComposerAttachmentAdmission {
  readonly entryIds: readonly string[];
  readonly rejected: readonly ComposerAttachmentRejection[];
}

/** One owner and scope at a time. Runtime files/preview URLs never enter drafts. */
export interface ComposerAttachmentController {
  readonly getSnapshot: () => ComposerAttachmentSnapshot;
  readonly subscribe: (listener: () => void) => () => void;
  /** New policy/callbacks affect future work; in-flight preparation is not replayed. */
  configure(options: ComposerAttachmentOptions): void;
  setScope(scope: ComposerScope): void;
  intake(
    files: readonly File[],
    source: ComposerAttachmentSource,
  ): ComposerAttachmentAdmission;
  remove(entryId: string): void;
  cancel(entryId: string): void;
  retry(entryId: string): boolean;
  clearRejections(): void;
  /** Restored binary metadata is never sufficient to mark an occurrence ready. */
  restore(attachments: readonly ComposerDraftAttachment[]): void;
  draftSnapshot(): readonly ComposerDraftAttachment[];
  /** Throws if any selected occurrence is not ready; never silently omits files. */
  sendableSnapshot(): readonly ComposerSendableAttachment[];
  file(entryId: string): File | undefined;
  previewUrl(entryId: string): string | undefined;
  /** Releases resources and invalidates work while keeping the owner reusable. */
  clear(): void;
  /** Terminal disposal for controllers owned outside the React hook. */
  dispose(): void;
}

export interface UseComposerAttachmentsResult extends ComposerAttachmentSnapshot {
  readonly controller: ComposerAttachmentController;
}
