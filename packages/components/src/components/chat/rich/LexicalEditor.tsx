import React, {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COPY_COMMAND,
  createEditor,
  CUT_COMMAND,
  CUT_TAG,
  HISTORY_PUSH_TAG,
  KEY_DOWN_COMMAND,
  mergeRegister,
  PASTE_COMMAND,
  PASTE_TAG,
  RootNode,
  SELECTION_CHANGE_COMMAND,
  type LexicalEditor as Editor,
} from "lexical";
import {
  createEmptyHistoryState,
  registerHistory,
  type HistoryState,
} from "@lexical/history";
import { registerPlainText } from "@lexical/plain-text";
import type { ComposerDocumentUpdate } from "../Composer.types";
import type {
  ComposerEditorAdapterProps,
  ComposerEditorHandle,
} from "../composer/EditorAdapter.types";
import { exportComposerText, readComposerDocument } from "../composer/document";
import {
  $applyComposerProvider,
  $claimComposerCommand,
  $composerClipboardDocument,
  $composerSelection,
  $exportComposerDocument,
  $insertComposerDocument,
  $insertComposerQuote,
  $insertComposerReference,
  $normalizeComposerCommands,
  $replaceComposerDocument,
  ComposerAtomNode,
} from "./nodes";

export const COMPOSER_CLIPBOARD_TYPE = "application/x-duskmoon-composer+json";
const EXTERNAL_REPLACE = "duskmoon-composer-external";

/**
 * Vanilla Lexical adapter. Same-origin/revision echoes retain history/selection;
 * explicit replace/restore/scope/clear values reset history. No Lexical data is
 * exported through onChange or placed in portable drafts.
 */
const LexicalEditor = forwardRef<
  ComposerEditorHandle,
  ComposerEditorAdapterProps
>((props, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const historyRef = useRef<HistoryState | null>(null);
  const latest = useRef(props);
  const composing = useRef(false);
  const ready = useRef(false);
  const revision = useRef(props.value.revision);
  const originId = `${useId()}-editor`;
  const applied = useRef<
    | {
        originId: string;
        revision: number;
        generation: number;
      }
    | undefined
  >(undefined);
  const emitted = useRef<ComposerDocumentUpdate | undefined>(undefined);
  const documentSignature = useRef("");
  const selectionSignature = useRef("");

  useLayoutEffect(() => {
    latest.current = props;
  });

  function report(error: unknown) {
    const cause = error instanceof Error ? error : new Error(String(error));
    if (latest.current.onError) latest.current.onError(cause);
    else throw cause;
  }

  useImperativeHandle(ref, () => {
    function transact(action: () => void) {
      const editor = editorRef.current;
      if (
        !editor ||
        !ready.current ||
        latest.current.disabled ||
        composing.current ||
        editor.isComposing()
      )
        return;
      editor.update(action, { discrete: true, tag: HISTORY_PUSH_TAG });
    }
    return {
      focus: () => editorRef.current?.focus(),
      insertReference: (reference) =>
        transact(() => $insertComposerReference(reference)),
      insertQuote: (quote) => transact(() => $insertComposerQuote(quote)),
      claimCommand: (command, source) =>
        transact(() => $claimComposerCommand(command, source)),
      insertText: (text) =>
        transact(() => {
          const selection = $getSelection();
          ($isRangeSelection(selection)
            ? selection
            : $getRoot().selectEnd()
          ).insertRawText(text);
        }),
      selection: () =>
        editorRef.current?.getEditorState().read($composerSelection) ?? null,
      applyProvider: (effect) => {
        if (
          effect.request.documentRevision !== revision.current ||
          effect.request.instanceGeneration !==
            latest.current.instanceGeneration
        )
          return false;
        let applied = false;
        transact(() => {
          applied = $applyComposerProvider(effect);
        });
        return applied;
      },
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    let initializationError: Error | undefined;
    const editor = createEditor({
      namespace: "DuskMoonComposer",
      nodes: [ComposerAtomNode],
      editable: !latest.current.disabled,
      onError: (error) => {
        initializationError = error;
        report(error);
      },
    });
    editorRef.current = editor;
    const history = createEmptyHistoryState();
    historyRef.current = history;
    function notifySelection() {
      const selection = $composerSelection();
      const signature = JSON.stringify(selection);
      if (signature !== selectionSignature.current) {
        selectionSignature.current = signature;
        latest.current.onSelectionChange(selection);
      }
    }
    const clipboard = (
      event: ClipboardEvent | KeyboardEvent | null,
      cut: boolean,
    ) => {
      if (
        !event ||
        !("clipboardData" in event) ||
        !event.clipboardData ||
        event.defaultPrevented
      )
        return false;
      const document = $composerClipboardDocument();
      if (!document) return false;
      event.clipboardData.setData(
        COMPOSER_CLIPBOARD_TYPE,
        JSON.stringify(document),
      );
      event.clipboardData.setData("text/plain", exportComposerText(document));
      event.preventDefault();
      if (cut && editor.isEditable()) {
        editor.update(
          () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) selection.removeText();
          },
          { tag: CUT_TAG },
        );
      }
      return true;
    };
    const cleanup = mergeRegister(
      registerPlainText(editor),
      registerHistory(editor, history, 300),
      editor.registerNodeTransform(RootNode, $normalizeComposerCommands),
      // React capture runs the wrapper first; consume its prevented key here
      // before Lexical's built-in Enter/shortcut handlers can also run it.
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (event) =>
          event.defaultPrevented ||
          composing.current ||
          event.isComposing ||
          event.keyCode === 229,
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        COPY_COMMAND,
        (event) => clipboard(event, false),
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        CUT_COMMAND,
        (event) => clipboard(event, true),
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          if (event.defaultPrevented) return true;
          if (!("clipboardData" in event) || !event.clipboardData) return false;
          event.preventDefault();
          if (!editor.isEditable() || composing.current || editor.isComposing())
            return true;
          const portable = event.clipboardData.getData(COMPOSER_CLIPBOARD_TYPE);
          try {
            if (portable) {
              const document = readComposerDocument(JSON.parse(portable));
              if (document.status !== "compatible")
                throw new TypeError(document.reason);
              editor.update(() => $insertComposerDocument(document.value), {
                tag: PASTE_TAG,
              });
            } else {
              const text = event.clipboardData.getData("text/plain");
              if (text)
                editor.update(
                  () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection))
                      selection.insertRawText(text);
                  },
                  { tag: PASTE_TAG },
                );
            }
          } catch (cause) {
            report(cause);
          }
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          notifySelection();
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerUpdateListener(({ editorState, tags }) => {
        if (!alive) return;
        editorState.read(() => {
          const document = $exportComposerDocument();
          const signature = JSON.stringify(document);
          root.dataset.empty = String(
            !document.command &&
              document.content.every(
                (node) => node.type === "text" && !node.text,
              ),
          );
          notifySelection();
          if (signature === documentSignature.current) return;
          documentSignature.current = signature;
          // setRootElement reconciles an empty editor before the controlled
          // document is installed. Mounting must never publish that as an edit.
          if (!ready.current || tags.has(EXTERNAL_REPLACE)) return;
          const update: ComposerDocumentUpdate = {
            document,
            revision:
              Math.max(revision.current, latest.current.value.revision) + 1,
            origin: "edit",
            originId,
          };
          revision.current = update.revision;
          emitted.current = update;
          latest.current.onChange(update);
        });
      }),
    );
    try {
      editor.setRootElement(root);
      const value = latest.current.value;
      revision.current = value.revision;
      editor.update(() => $replaceComposerDocument(value.document), {
        discrete: true,
        tag: EXTERNAL_REPLACE,
      });
      if (initializationError) throw initializationError;
      editor.update(
        () => {
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        },
        { discrete: true },
      );
      history.current = { editor, editorState: editor.getEditorState() };
      applied.current = {
        originId: value.originId,
        revision: value.revision,
        generation: latest.current.instanceGeneration,
      };
      ready.current = true;
      latest.current.onReady?.(true);
    } catch (cause) {
      report(cause);
    }
    return () => {
      alive = false;
      ready.current = false;
      composing.current = false;
      cleanup();
      editor.setRootElement(null);
      if (editorRef.current === editor) editorRef.current = null;
      if (historyRef.current === history) historyRef.current = null;
      applied.current = undefined;
      emitted.current = undefined;
      selectionSignature.current = "";
      documentSignature.current = "";
      latest.current.onReady?.(false);
    };
  }, [originId]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.setEditable(!props.disabled);
    const previous = applied.current;
    const value = props.value;
    const sameGeneration = previous?.generation === props.instanceGeneration;
    if (
      sameGeneration &&
      previous?.originId === value.originId &&
      previous.revision === value.revision
    )
      return;
    if (
      sameGeneration &&
      emitted.current?.originId === value.originId &&
      emitted.current.revision === value.revision
    ) {
      applied.current = {
        originId: value.originId,
        revision: value.revision,
        generation: props.instanceGeneration,
      };
      return;
    }
    try {
      revision.current = value.revision;
      composing.current = false;
      editor.update(() => $replaceComposerDocument(value.document), {
        discrete: true,
        tag: EXTERNAL_REPLACE,
      });
      editor.update(
        () => {
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        },
        { discrete: true },
      );
      if (historyRef.current)
        historyRef.current.current = {
          editor,
          editorState: editor.getEditorState(),
        };
      emitted.current = undefined;
      applied.current = {
        originId: value.originId,
        revision: value.revision,
        generation: props.instanceGeneration,
      };
    } catch (cause) {
      report(cause);
    }
  }, [props.value, props.instanceGeneration, props.disabled]);

  return (
    <div
      ref={rootRef}
      id={props.id}
      className="chat-composer-editor"
      role="textbox"
      tabIndex={0}
      aria-multiline="true"
      aria-label={props.label}
      aria-describedby={props.describedBy}
      aria-invalid={props.invalid || undefined}
      aria-controls={props.controls}
      aria-activedescendant={props.activeDescendant}
      aria-autocomplete={props.hasSuggestions ? "list" : undefined}
      aria-haspopup={props.hasSuggestions ? "listbox" : undefined}
      aria-disabled={props.disabled || undefined}
      contentEditable={!props.disabled}
      suppressContentEditableWarning
      onCompositionStartCapture={() => {
        composing.current = true;
      }}
      onCompositionEndCapture={() => {
        composing.current = false;
      }}
      onKeyDownCapture={(event) => {
        if (
          event.defaultPrevented ||
          composing.current ||
          event.nativeEvent.isComposing ||
          event.keyCode === 229 ||
          editorRef.current?.isComposing()
        )
          return;
        latest.current.onKeyDown?.(event);
      }}
      // File intake runs before Lexical prevents the native paste/drop event.
      onPasteCapture={(event) => {
        if (!event.defaultPrevented) latest.current.onPaste?.(event);
      }}
      onDropCapture={(event) => {
        if (!event.defaultPrevented) latest.current.onDrop?.(event);
      }}
    />
  );
});
LexicalEditor.displayName = "RichChatComposer.Editor";
export default LexicalEditor;
