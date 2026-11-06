import type {
  ComposerCapabilities,
  ComposerCommand,
  ComposerDocument,
  ComposerError,
  ComposerIntent,
  ComposerJson,
  ComposerReceipt,
  ComposerScope,
  ComposerSendableAttachment,
  ComposerSubmission,
} from "./Composer.types";

/** Run state is independent of admission, editing, and attachment preparation. */
export interface ComposerRuntimeState {
  readonly status: "idle" | "running" | "disconnected" | "read_only";
  readonly activeTurnId?: string;
}

export interface ComposerActionPolicy {
  /** Default while a run is active. Never implies that the host supports it. */
  readonly runningIntent?: "follow_up" | "steer";
  /** Plain Composer keeps its historical shortcut unless explicitly selected. */
  readonly shortcut?: "modifier_enter" | "enter";
}

export interface ComposerAttempt {
  readonly snapshot: ComposerSubmission;
  readonly instanceId: string;
  readonly instanceGeneration: number;
  readonly createdAt: number;
  readonly status: "pending" | "accepted" | "rejected" | "unknown";
  readonly receipt?: ComposerReceipt;
}

/**
 * An application-owned object that outlives an editor mount. Retention does not
 * itself promise reload persistence. Never evict pending/unknown attempts.
 */
export interface ComposerRecoveryOwner {
  readonly getSnapshot: () => readonly ComposerAttempt[];
  readonly subscribe: (listener: () => void) => () => void;
  readonly retain: (attempt: ComposerAttempt) => void;
}

export interface ComposerSessionHost {
  readonly capabilities: ComposerCapabilities;
  readonly recovery: ComposerRecoveryOwner;
  readonly submit: (
    snapshot: ComposerSubmission,
    signal: AbortSignal,
  ) => Promise<ComposerReceipt>;
  /** A missing record is still unresolved; lookup never implicitly retries. */
  readonly reconcile?: (
    snapshot: ComposerSubmission,
    signal: AbortSignal,
  ) => Promise<ComposerReceipt | { readonly outcome: "not_found" }>;
  /** Explicit host authorization is required before resending the SAME snapshot. */
  readonly authorizeRetry?: (attempt: ComposerAttempt) => Promise<boolean>;
  /** The host catalog distinguishes prompt commands from non-prompt actions. */
  readonly commandOperation?: (
    command: ComposerCommand,
  ) => "prompt" | "command";
}

export interface ComposerSessionContext {
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly document: ComposerDocument;
  readonly revision: number;
  readonly instanceGeneration: number;
  readonly runtime: ComposerRuntimeState;
  readonly host: ComposerSessionHost;
  readonly policy?: ComposerActionPolicy;
  readonly attachments?: readonly ComposerSendableAttachment[];
  readonly attachmentsPending?: boolean;
  readonly options?: Readonly<Record<string, ComposerJson>>;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly canSubmit?: boolean;
  readonly allowAttachmentOnly?: boolean;
  /** Called only for the exact still-current submitted document revision. */
  readonly onAccepted?: (snapshot: ComposerSubmission) => void;
  /** Attachment clearing uses occurrence identity, independently of text edits. */
  readonly onAcceptedAttachments?: (
    attachments: readonly ComposerSendableAttachment[],
  ) => void;
}

export interface ComposerActionEligibility {
  readonly allowed: boolean;
  readonly intent?: ComposerIntent;
  readonly operation: "prompt" | "command";
  readonly label: string;
  readonly reason?: string;
}

export interface ComposerSessionSnapshot {
  readonly submitting: boolean;
  readonly error?: ComposerError;
  readonly lastReceipt?: ComposerReceipt;
  /** Failed host handoffs remain inspectable, including after disposal. Export or
   * persist these snapshots before discarding their controller. No auto-retry. */
  readonly recoveryFailures?: readonly ComposerAttempt[];
}
