import type { ComponentProps, ReactNode } from "react";
import type {
  ComposerDocumentUpdate,
  ComposerJson,
  ComposerScope,
} from "./Composer.types";
import type { ComposerAttachmentOptions } from "./ComposerAttachment.types";
import type { ComposerDraftAdapter } from "./ComposerDraft.types";
import type {
  ComposerCompletionProvider,
  ComposerProviderSelectionEffect,
} from "./ComposerProvider.types";
import type {
  ComposerActionPolicy,
  ComposerRuntimeState,
  ComposerSessionHost,
} from "./ComposerSession.types";
import type { ComposerEditorHandle } from "./composer/EditorAdapter.types";

/** Shared semantic session API; /chat/rich selects the optional editor adapter. */
export interface ChatSessionComposerProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange" | "onSubmit" | "ref"
> {
  readonly value: ComposerDocumentUpdate;
  readonly onDocumentChange: (update: ComposerDocumentUpdate) => void;
  readonly scope: ComposerScope;
  readonly draftKey: string;
  readonly host: ComposerSessionHost;
  readonly runtime?: ComposerRuntimeState;
  readonly policy?: ComposerActionPolicy;
  /** Captured immutably with each logical submission. Interpretation is host-owned. */
  readonly options?: Readonly<Record<string, ComposerJson>>;
  /** Optional scoped storage. Loading is automatic; the user explicitly saves. */
  readonly draftAdapter?: ComposerDraftAdapter;
  readonly attachmentOptions?: Omit<ComposerAttachmentOptions, "scope">;
  readonly providers?: readonly ComposerCompletionProvider[];
  /** Invocation is a host action, independent of any prompt admission. */
  readonly onProviderInvoke?: (
    effect: ComposerProviderSelectionEffect,
  ) => void | Promise<void>;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly canSubmit?: boolean;
  readonly allowAttachmentOnly?: boolean;
  /** Compact Add menu, one send/stop action and ready-image strip. @default false */
  readonly compact?: boolean;
  /** Additional actions in the compact Add menu. */
  readonly addMenu?: ReactNode;
  /** Attached context bar, rendered first inside the composer. */
  readonly context?: ReactNode;
  readonly onStop?: () => void;
  readonly label?: string;
  readonly attachLabel?: string;
  readonly stopLabel?: string;
  readonly minRows?: number;
  readonly maxRows?: number;
  readonly error?: ReactNode;
  readonly children?: ReactNode;
}

/** The rich and semantic plain adapters expose the same editor-independent API. */
export type ChatSessionComposerHandle = ComposerEditorHandle;

/** Final R0 public name: RichChatComposer, exported only at /chat/rich. */
export type RichChatComposerProps = ChatSessionComposerProps;
export type RichChatComposerHandle = ChatSessionComposerHandle;
