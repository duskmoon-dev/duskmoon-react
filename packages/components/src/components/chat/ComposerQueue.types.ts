import type React from "react";
import type {
  ComposerCapabilities,
  ComposerDocument,
  ComposerQueueItem,
  ComposerQueueMutation,
  ComposerQueueMutationResult,
  ComposerQueueProjection,
} from "./Composer.types";

export interface ComposerQueueEditorProps {
  readonly item: ComposerQueueItem;
  readonly value: ComposerDocument;
  readonly onChange: (document: ComposerDocument) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly pending: boolean;
}

export interface ChatAuthoritativeQueueProps {
  readonly projection: ComposerQueueProjection;
  readonly capabilities: ComposerCapabilities["queue"];
  readonly targetTurnId?: string;
  readonly onMutation: (
    mutation: ComposerQueueMutation,
    signal: AbortSignal,
  ) => Promise<ComposerQueueMutationResult>;
  /** Apply the canonical projection, including rejected/conflicting operations. */
  readonly onProjection: (projection: ComposerQueueProjection) => void;
  /** Required for structured document edits. Attachments remain host-owned. */
  readonly renderDocumentEditor?: (
    props: ComposerQueueEditorProps,
  ) => React.ReactNode;
  readonly label?: string;
  readonly className?: string;
}

export interface ComposerSettingChoice {
  readonly value: string;
  readonly label: string;
  readonly unavailableReason?: string;
}
export interface ComposerSetting {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly choices: readonly ComposerSettingChoice[];
  readonly unavailableReason?: string;
}
export interface ComposerSettingRequest {
  readonly requestId: string;
  readonly scopeKey: string;
  readonly settingId: string;
  readonly expectedRevision: number;
  readonly value: string;
}
export type ComposerSettingResult = {
  readonly requestId: string;
  readonly scopeKey: string;
  readonly settingId: string;
  readonly revision: number;
} & (
  | { readonly outcome: "accepted"; readonly value: string }
  | { readonly outcome: "rejected"; readonly message: string }
);
export interface ComposerSettingsProps {
  readonly scopeKey: string;
  readonly revision: number;
  readonly settings: readonly ComposerSetting[];
  /** Requests are serialized because all settings share one authoritative revision. */
  readonly onRequest: (
    request: ComposerSettingRequest,
    signal: AbortSignal,
  ) => Promise<ComposerSettingResult>;
  /** Host applies acknowledged values; selection stays controlled until then. */
  readonly onAcknowledged: (result: ComposerSettingResult) => void;
  readonly label?: string;
  readonly className?: string;
}
