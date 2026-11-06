import type React from "react";
import type {
  ComposerCommand,
  ComposerDocumentUpdate,
  ComposerQuoteNode,
  ComposerReferenceNode,
} from "../Composer.types";
import type {
  ComposerProviderSelection,
  ComposerProviderSelectionEffect,
} from "../ComposerProvider.types";

/** Public semantic insertion commands never expose editor classes or node keys. */
export interface ComposerEditorHandle {
  focus: () => void;
  insertReference: (reference: ComposerReferenceNode) => void;
  insertQuote: (quote: ComposerQuoteNode) => void;
  claimCommand: (command: ComposerCommand, source: string) => void;
  insertText: (text: string) => void;
  applyProvider: (effect: ComposerProviderSelectionEffect) => boolean;
  selection: () => ComposerProviderSelection | null;
}

/** Private adapter boundary; the wrapper owns providers/admission, never history. */
export interface ComposerEditorAdapterProps {
  readonly value: ComposerDocumentUpdate;
  readonly onChange: (value: ComposerDocumentUpdate) => void;
  readonly onSelectionChange: (
    selection: ComposerProviderSelection | null,
  ) => void;
  readonly instanceGeneration: number;
  readonly disabled?: boolean;
  readonly minRows?: number;
  readonly maxRows?: number;
  readonly id: string;
  readonly label: string;
  readonly describedBy?: string;
  readonly invalid?: boolean;
  readonly controls?: string;
  readonly activeDescendant?: string;
  readonly hasSuggestions?: boolean;
  /** Invoked only after the adapter's IME/229 and consumer preventDefault gates. */
  readonly onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  readonly onPaste?: React.ClipboardEventHandler<HTMLDivElement>;
  readonly onDrop?: React.DragEventHandler<HTMLDivElement>;
  readonly onError?: (error: Error) => void;
  readonly onReady?: (ready: boolean) => void;
}
