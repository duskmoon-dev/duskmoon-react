import type {
  ComposerDocument,
  ComposerDraft,
  ComposerDraftAttachment,
  ComposerError,
  ComposerScope,
} from "./Composer.types";

export interface ComposerDraftLoadRequest {
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly signal: AbortSignal;
}

/**
 * Host-owned storage and retention. Keep this object stable across editor mounts
 * to share serialized writes. Other writers must coordinate at the storage layer.
 * A save promise must settle only when that write has actually finished.
 */
export interface ComposerDraftAdapter {
  /** null/undefined means absent; other values are validated, including legacy strings. */
  readonly load: (request: ComposerDraftLoadRequest) => Promise<unknown>;
  readonly save: (draft: ComposerDraft, signal: AbortSignal) => Promise<void>;
}

export interface ComposerDraftContext {
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly revision: number;
  readonly document: ComposerDocument;
  readonly attachments?: readonly ComposerDraftAttachment[];
  readonly instanceGeneration: number;
  /** Distinguishes explicit replacements even if content/revision were unchanged. */
  readonly originId?: string;
  readonly adapter: ComposerDraftAdapter;
  /** Apply an explicit restore in the editor, then echo a new controlled revision. */
  readonly onRestore?: (draft: ComposerDraft) => void;
  /** Preserve/export this original value; do not flatten unsupported document data. */
  readonly onIncompatible?: (input: unknown, reason: string) => void;
}

/** An exact record token is required when authorizing overwrite of incompatible data. */
export interface ComposerDraftIncompatibility {
  readonly input: unknown;
  readonly reason: string;
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly instanceGeneration: number;
}

export interface ComposerDraftLoaded {
  readonly draft: ComposerDraft;
  readonly migrated: boolean;
  /** A valid late load is retained for inspection even when newer editing wins. */
  readonly applied: boolean;
}

export interface ComposerDraftSnapshot {
  readonly status: "idle" | "loading" | "ready" | "error" | "incompatible";
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly instanceGeneration: number;
  readonly saving: boolean;
  /** Save is blocked until the editor acknowledges the requested controlled restore. */
  readonly restorePending: boolean;
  readonly overwriteAllowed: boolean;
  readonly loaded?: ComposerDraftLoaded;
  readonly incompatible?: ComposerDraftIncompatibility;
  readonly error?: ComposerError;
  readonly errorOperation?: "load" | "save" | "restore" | "incompatible";
  readonly lastSavedRevision?: number;
}

export type ComposerDraftSaveResult =
  | { readonly outcome: "saved" | "superseded"; readonly draft: ComposerDraft }
  | {
      readonly outcome: "error";
      readonly draft: ComposerDraft;
      readonly error: ComposerError;
    }
  | {
      readonly outcome: "blocked";
      readonly reason:
        "inactive" | "loading" | "load_error" | "incompatible" | "restoring";
    };

export interface ComposerDraftController {
  readonly getSnapshot: () => ComposerDraftSnapshot;
  readonly subscribe: (listener: () => void) => () => void;
  /** Activating after disposal supports React StrictMode effect replay. */
  activate(): void;
  update(context: ComposerDraftContext): void;
  reload(): Promise<void>;
  /** Explicit persistence policy; no per-keystroke autosave is imposed by this controller. */
  save(): Promise<ComposerDraftSaveResult>;
  /** Current record only; an old context's confirmation cannot authorize another overwrite. */
  allowOverwrite(incompatible: ComposerDraftIncompatibility): boolean;
  /** Aborts reads. Already requested portable saves continue through the host-owned queue. */
  dispose(): void;
}

export interface UseComposerDraftResult {
  readonly controller: ComposerDraftController;
  readonly snapshot: ComposerDraftSnapshot;
}
