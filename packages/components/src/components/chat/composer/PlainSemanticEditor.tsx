import React, {
  forwardRef,
  useId,
  useImperativeHandle,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import type { ComposerDocument } from "../Composer.types";
import type { ComposerProviderSelection } from "../ComposerProvider.types";
import type {
  ComposerEditorAdapterProps,
  ComposerEditorHandle,
} from "./EditorAdapter.types";
import { PlainEditor } from "./PlainEditor";
import type { PlainEditorHandle } from "./PlainEditor";
import { migrateLegacyComposerDocument } from "./document";

export function isPlainComposerDocument(document: ComposerDocument) {
  return (
    !document.command && document.content.every((node) => node.type === "text")
  );
}

/** Native textarea adapter for protocol sessions; structured data is never flattened. */
export const PlainSemanticEditor = forwardRef<
  ComposerEditorHandle,
  ComposerEditorAdapterProps
>((props, ref) => {
  const editor = useRef<PlainEditorHandle>(null);
  const originId = useId();
  const latest = useRef(props);
  const revision = useRef(props.value.revision);
  const pendingCaret = useRef<{ revision: number; offset: number } | undefined>(
    undefined,
  );
  const text = props.value.document.content
    .map((node) => (node.type === "text" ? node.text : ""))
    .join("");
  useLayoutEffect(() => {
    latest.current = props;
    revision.current = Math.max(revision.current, props.value.revision);
    const caret = pendingCaret.current;
    if (
      caret &&
      props.value.originId === originId &&
      props.value.revision === caret.revision
    ) {
      editor.current?.select(caret.offset, caret.offset);
      pendingCaret.current = undefined;
    } else if (caret && props.value.revision >= caret.revision) {
      pendingCaret.current = undefined;
    }
  });
  useLayoutEffect(() => {
    latest.current.onReady?.(true);
    return () => latest.current.onReady?.(false);
  }, []);
  const change = useCallback(
    (value: string, caret?: number) => {
      revision.current =
        Math.max(revision.current, latest.current.value.revision) + 1;
      if (caret !== undefined)
        pendingCaret.current = { revision: revision.current, offset: caret };
      latest.current.onChange({
        document: migrateLegacyComposerDocument(value),
        revision: revision.current,
        origin: "edit",
        originId,
      });
    },
    [originId],
  );
  function selection(): ComposerProviderSelection | null {
    const currentText = latest.current.value.document.content
      .map((node) => (node.type === "text" ? node.text : ""))
      .join("");
    const range = editor.current?.selection(currentText);
    if (!range) return null;
    let offset = 0;
    for (const [
      nodeIndex,
      node,
    ] of latest.current.value.document.content.entries()) {
      if (node.type !== "text") return null;
      if (range.selectionStart <= offset + node.text.length) {
        if (range.selectionEnd > offset + node.text.length) return null;
        return {
          nodeIndex,
          start: range.selectionStart - offset,
          end: range.selectionEnd - offset,
        };
      }
      offset += node.text.length;
    }
    return latest.current.value.document.content.length
      ? null
      : { nodeIndex: 0, start: 0, end: 0 };
  }
  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor.current?.focus(),
      selection,
      insertText: (value) => {
        const source = latest.current.value.document.content
          .map((node) => (node.type === "text" ? node.text : ""))
          .join("");
        const range = editor.current?.selection(source);
        if (!range || latest.current.disabled) return;
        change(
          source.slice(0, range.selectionStart) +
            value +
            source.slice(range.selectionEnd),
          range.selectionStart + value.length,
        );
        editor.current?.focus();
      },
      insertReference: () => {
        throw new Error("References require the optional rich editor");
      },
      insertQuote: () => {
        throw new Error("Quotes require the optional rich editor");
      },
      claimCommand: () => {
        throw new Error("Claimed commands require the optional rich editor");
      },
      applyProvider: (effect) => {
        const current = latest.current;
        const range = selection();
        if (
          current.disabled ||
          effect.action.type !== "insert" ||
          effect.action.command ||
          effect.action.content.some((node) => node.type !== "text") ||
          current.value.revision !== effect.request.documentRevision ||
          !range ||
          range.nodeIndex !== effect.request.trigger.nodeIndex ||
          range.start !== range.end ||
          range.end !== effect.request.trigger.caret
        )
          return false;
        const node = current.value.document.content[range.nodeIndex];
        if (
          node?.type !== "text" ||
          node.text.slice(
            effect.request.trigger.start,
            effect.request.trigger.end,
          ) !== effect.request.trigger.text
        )
          return false;
        const content = [...current.value.document.content];
        const insertedText = effect.action.content
          .map((item) => (item.type === "text" ? item.text : ""))
          .join("");
        const precedingLength = current.value.document.content
          .slice(0, range.nodeIndex)
          .reduce(
            (length, item) =>
              length + (item.type === "text" ? item.text.length : 0),
            0,
          );
        content.splice(range.nodeIndex, 1, {
          type: "text",
          text:
            node.text.slice(0, effect.request.trigger.start) +
            insertedText +
            node.text.slice(effect.request.trigger.end),
        });
        change(
          content
            .map((item) => (item.type === "text" ? item.text : ""))
            .join(""),
          precedingLength + effect.request.trigger.start + insertedText.length,
        );
        editor.current?.focus();
        return true;
      },
    }),
    [change],
  );
  return (
    <PlainEditor
      ref={editor}
      value={text}
      disabled={!!props.disabled}
      minRows={props.minRows ?? 1}
      maxRows={props.maxRows ?? 6}
      generation={props.instanceGeneration}
      composerId={props.id}
      hasError={!!props.invalid}
      hasCompletion={!!props.hasSuggestions}
      showCompletion={!!props.controls}
      activeIndex={-1}
      activeDescendant={props.activeDescendant}
      textareaProps={{
        "aria-label": props.label,
        "aria-describedby": props.describedBy,
        "aria-controls": props.controls,
        "aria-activedescendant": props.activeDescendant,
        onSelect: () => latest.current.onSelectionChange(selection()),
        onBlur: () => latest.current.onSelectionChange(null),
        onPaste: (event) =>
          latest.current.onPaste?.(
            event as unknown as React.ClipboardEvent<HTMLDivElement>,
          ),
        onDrop: (event) =>
          latest.current.onDrop?.(
            event as unknown as React.DragEvent<HTMLDivElement>,
          ),
      }}
      onChange={(value) => {
        change(value);
        const range = editor.current?.selection(value);
        latest.current.onSelectionChange(
          range
            ? {
                nodeIndex: 0,
                start: range.selectionStart,
                end: range.selectionEnd,
              }
            : null,
        );
      }}
      onKeyDown={(event) =>
        latest.current.onKeyDown?.(
          event as unknown as React.KeyboardEvent<HTMLDivElement>,
        )
      }
    />
  );
});
PlainSemanticEditor.displayName = "PlainSemanticEditor";
