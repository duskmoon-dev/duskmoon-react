/** Portable JSON values. Application adapters must validate their meaning. */
export type ComposerJson =
  | null
  | boolean
  | number
  | string
  | readonly ComposerJson[]
  | { readonly [key: string]: ComposerJson };

/** Both fields are opaque identities, never client-side authorization. */
export interface ComposerScope {
  readonly contextKey: string;
  readonly conversationId: string;
}

export interface ComposerTextNode {
  readonly type: "text";
  readonly text: string;
}

export interface ComposerReferenceNode {
  readonly type: "reference";
  /** Identity of this occurrence, distinct from the provider's target. */
  readonly nodeId: string;
  readonly providerId: string;
  readonly refId: string;
  readonly label: string;
  readonly plainText: string;
}

/** Untrusted provenance; the application resolves and authorizes the source. */
export interface ComposerQuoteSource {
  readonly providerId?: string;
  readonly refId?: string;
  readonly label?: string;
  readonly messageId?: string;
  readonly conversationId?: string;
}

export interface ComposerQuoteNode {
  readonly type: "quote";
  readonly nodeId: string;
  readonly text: string;
  readonly source?: ComposerQuoteSource;
}

export type ComposerNode =
  ComposerTextNode | ComposerReferenceNode | ComposerQuoteNode;

export interface ComposerCommand {
  readonly providerId: string;
  readonly commandId: string;
}

export interface ComposerDocument {
  readonly schemaVersion: 1;
  readonly content: readonly ComposerNode[];
  /** Claimed leading command; argument interpretation belongs to its provider. */
  readonly command?: ComposerCommand;
}

export type ComposerDocumentOrigin =
  "edit" | "replace" | "restore" | "scope_switch" | "clear";

/** Echo the same originId/revision without resetting selection or history. */
export interface ComposerDocumentUpdate {
  readonly document: ComposerDocument;
  readonly revision: number;
  readonly origin: ComposerDocumentOrigin;
  readonly originId: string;
}

export interface ComposerAttachmentMetadata {
  readonly name: string;
  readonly mediaType: string;
  readonly size: number;
  readonly lastModified?: number;
}

/** Application-issued reference or receipt; contains no local binary handle. */
export interface ComposerAttachmentHandle {
  readonly providerId: string;
  readonly reference: ComposerJson;
}

export interface ComposerSendableAttachment {
  readonly entryId: string;
  readonly metadata: ComposerAttachmentMetadata;
  readonly handle: ComposerAttachmentHandle;
}

export type ComposerAttachmentState =
  | { readonly status: "preparing" | "uploading"; readonly progress?: number }
  | { readonly status: "ready"; readonly handle: ComposerAttachmentHandle }
  | { readonly status: "error"; readonly error: ComposerError }
  | { readonly status: "cancelled" | "reattach" };

/** One selected occurrence; removing/reselecting a file creates a new entryId. */
export interface ComposerAttachmentEntry {
  readonly entryId: string;
  readonly metadata: ComposerAttachmentMetadata;
  readonly state: ComposerAttachmentState;
}

export type ComposerDraftAttachment = {
  readonly entryId: string;
  readonly metadata: ComposerAttachmentMetadata;
} & (
  | { readonly status: "reattach" }
  | { readonly status: "ready"; readonly handle: ComposerAttachmentHandle }
);

export interface ComposerDraft {
  readonly draftVersion: 1;
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly revision: number;
  readonly document: ComposerDocument;
  readonly attachments: readonly ComposerDraftAttachment[];
}

export interface ComposerError {
  readonly code: string;
  readonly message: string;
  readonly details?: ComposerJson;
}

export type ComposerIntent = "send" | "follow_up" | "steer";
export type ComposerDelivery = "immediate" | "follow_up" | "steer";

interface ComposerSubmissionBase {
  readonly protocolVersion: 1;
  /** Reused only for reconciliation or an explicitly authorized retry. */
  readonly clientSubmissionId: string;
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly draftRevision: number;
  readonly document: ComposerDocument;
  readonly attachments: readonly ComposerSendableAttachment[];
  readonly options: Readonly<Record<string, ComposerJson>>;
}

export type ComposerPromptSubmission = ComposerSubmissionBase & {
  readonly operation: "prompt";
} & (
    | { readonly intent: "send" | "follow_up"; readonly targetTurnId?: never }
    | { readonly intent: "steer"; readonly targetTurnId: string }
  );

export type ComposerCommandSubmission = ComposerSubmissionBase & {
  readonly operation: "command";
  readonly document: ComposerDocument & { readonly command: ComposerCommand };
  readonly intent?: never;
  readonly targetTurnId?: never;
};

export type ComposerSubmission =
  ComposerPromptSubmission | ComposerCommandSubmission;

interface ComposerReceiptBase {
  readonly protocolVersion: 1;
  readonly clientSubmissionId: string;
  readonly scope: ComposerScope;
}

export type ComposerAcceptedPromptReceipt = ComposerReceiptBase & {
  readonly outcome: "accepted";
  readonly operation: "prompt";
  readonly delivery: ComposerDelivery;
  /** Admission, not completed generation or exactly-once execution. */
  readonly persistence: "volatile" | "durable";
  readonly messageId?: string;
  readonly turnId?: string;
  readonly queueItemId?: string;
  readonly queueRevision?: number;
};

export type ComposerAcceptedCommandReceipt = ComposerReceiptBase & {
  readonly outcome: "accepted";
  readonly operation: "command";
  readonly result: ComposerJson;
  readonly delivery?: never;
  readonly persistence?: never;
  readonly messageId?: never;
  readonly turnId?: never;
  readonly queueItemId?: never;
};

export type ComposerUnresolvedReceipt = ComposerReceiptBase & {
  readonly outcome: "rejected" | "unknown";
  readonly operation: "prompt" | "command";
  readonly error: ComposerError;
};

export type ComposerReceipt =
  | ComposerAcceptedPromptReceipt
  | ComposerAcceptedCommandReceipt
  | ComposerUnresolvedReceipt;

/** Portable request identity. Offsets are local UTF-16 offsets, not server ranges. */
export interface ComposerProviderRequest {
  readonly requestId: string;
  readonly providerId: string;
  readonly scope: ComposerScope;
  readonly instanceGeneration: number;
  readonly documentRevision: number;
  readonly query: string;
  readonly trigger: {
    readonly text: string;
    readonly nodeIndex: number;
    readonly start: number;
    readonly end: number;
    readonly caret: number;
  };
}

export type ComposerProviderAction =
  | {
      readonly type: "insert";
      readonly content: readonly ComposerNode[];
      readonly command?: ComposerCommand;
    }
  | { readonly type: "drill"; readonly refId: string }
  | {
      readonly type: "invoke";
      readonly command: ComposerCommand;
      readonly arguments?: ComposerJson;
    };

export interface ComposerProviderCandidate {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly group?: string;
  readonly disabledReason?: string;
  readonly action: ComposerProviderAction;
}

export interface ComposerProviderResult {
  readonly request: ComposerProviderRequest;
  readonly candidates: readonly ComposerProviderCandidate[];
}

/** Runtime callback boundary. Cancellation is separate from the portable request. */
export interface ComposerProvider {
  readonly providerId: string;
  readonly query: (
    request: ComposerProviderRequest,
    signal: AbortSignal,
  ) => Promise<ComposerProviderResult>;
}

export interface ComposerCapabilities {
  readonly protocolVersion: 1;
  readonly documentVersions: readonly number[];
  readonly intents: readonly ComposerIntent[];
  readonly commands: boolean;
  readonly attachments: boolean;
  readonly queue: {
    readonly edit: "none" | "text" | "document";
    readonly remove: boolean;
    readonly promote: boolean;
  };
  /** Only the host can advertise persistence and reconciliation guarantees. */
  readonly durableRecovery: boolean;
}

export interface ComposerQueueItem {
  readonly id: string;
  readonly document: ComposerDocument;
  readonly attachments: readonly ComposerSendableAttachment[];
  readonly capabilities: ComposerCapabilities["queue"];
}

/** Confirmed authoritative membership/order; pending admissions are separate. */
export interface ComposerQueueProjection {
  readonly protocolVersion: 1;
  readonly scope: ComposerScope;
  readonly revision: number;
  readonly items: readonly ComposerQueueItem[];
}

export type ComposerQueueMutation = {
  readonly requestId: string;
  readonly scope: ComposerScope;
  readonly itemId: string;
  readonly expectedRevision: number;
} & (
  | { readonly operation: "remove" }
  | { readonly operation: "edit"; readonly document: ComposerDocument }
  | { readonly operation: "promote"; readonly targetTurnId: string }
);

export type ComposerQueueMutationResult = {
  readonly requestId: string;
  readonly projection: ComposerQueueProjection;
} & (
  | { readonly outcome: "accepted" }
  | { readonly outcome: "rejected"; readonly error: ComposerError }
);
