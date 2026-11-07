import React, {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import {
  getTextAreaCountClasses,
  textAreaWrapperClass,
} from "../../../classes/input";
import { cn } from "../../../utils";
import type {
  ChatComposerCompletionContext,
  ChatComposerProps,
} from "../Chat.types";

export interface PlainEditorHandle {
  focus: () => void;
  selection: (value: string) => ChatComposerCompletionContext;
  select: (start: number, end: number) => void;
}

interface PlainEditorProps {
  value: string;
  disabled: boolean;
  minRows: number;
  maxRows: number;
  generation: number;
  textareaProps?: ChatComposerProps["textareaProps"];
  composerId: string;
  hasError: boolean;
  hasCompletion: boolean;
  showCompletion: boolean;
  activeIndex: number;
  activeDescendant?: string;
  onChange: (value: string) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

/** Native textarea adapter; controlled echoes retain the same editor DOM. */
export const PlainEditor = forwardRef<PlainEditorHandle, PlainEditorProps>(
  (
    {
      value,
      disabled,
      minRows,
      maxRows,
      generation,
      textareaProps,
      composerId,
      hasError,
      hasCompletion,
      showCompletion,
      activeIndex,
      activeDescendant,
      onChange,
      onKeyDown,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const composingRef = useRef(false);
    const minimumRows = Math.max(1, Math.floor(minRows));
    const maximumRows = Math.max(minimumRows, Math.floor(maxRows));
    const { showCount, ...nativeProps } = textareaProps ?? {};
    // The integrated editor uses Core's composer surface, not a standalone input.
    delete nativeProps.size;
    delete nativeProps.status;
    delete nativeProps.variant;
    delete nativeProps.resize;

    useImperativeHandle(
      ref,
      () => ({
        focus: () => editorRef.current?.focus(),
        select: (start, end) =>
          editorRef.current?.setSelectionRange(start, end),
        selection: (currentValue) => ({
          value: currentValue,
          selectionStart:
            editorRef.current?.selectionStart ?? currentValue.length,
          selectionEnd: editorRef.current?.selectionEnd ?? currentValue.length,
        }),
      }),
      [],
    );

    useLayoutEffect(() => {
      composingRef.current = false;
    }, [generation]);

    useLayoutEffect(() => {
      const editor = editorRef.current;
      if (!editor) return;
      function measure() {
        if (!editor) return;
        const style = getComputedStyle(editor);
        const lineHeight = parseFloat(style.lineHeight) || 24;
        const padding =
          (parseFloat(style.paddingTop) || 0) +
          (parseFloat(style.paddingBottom) || 0);
        const borders =
          (parseFloat(style.borderTopWidth) || 0) +
          (parseFloat(style.borderBottomWidth) || 0);
        const adjustment =
          style.boxSizing === "border-box" ? padding + borders : 0;
        editor.style.height = "auto";
        const minimum = minimumRows * lineHeight + adjustment;
        const maximum = maximumRows * lineHeight + adjustment;
        const content = editor.scrollHeight - padding + adjustment;
        editor.style.height = `${Math.min(maximum, Math.max(minimum, content))}px`;
        editor.style.overflowY = content > maximum ? "auto" : "hidden";
      }
      measure();
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(measure);
      observer?.observe(editor);
      window.addEventListener("resize", measure);
      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", measure);
      };
    }, [value, minimumRows, maximumRows, textareaProps?.style]);

    const control = (
      <textarea
        {...nativeProps}
        ref={editorRef}
        className={cn("chat-composer-editor", textareaProps?.className)}
        value={value}
        disabled={disabled}
        rows={minimumRows}
        aria-label={
          textareaProps?.["aria-label"] ??
          (textareaProps?.["aria-labelledby"] ? undefined : "Message")
        }
        aria-describedby={
          cn(
            textareaProps?.["aria-describedby"],
            hasError && `${composerId}-error`,
          ) || undefined
        }
        aria-invalid={
          hasError || textareaProps?.status === "error"
            ? true
            : textareaProps?.["aria-invalid"]
        }
        aria-controls={showCompletion ? `${composerId}-completions` : undefined}
        aria-autocomplete={hasCompletion ? "list" : undefined}
        aria-haspopup={hasCompletion ? "listbox" : undefined}
        aria-activedescendant={
          activeDescendant ??
          (showCompletion && activeIndex >= 0
            ? `${composerId}-option-${activeIndex}`
            : undefined)
        }
        onChange={(event) => onChange(event.currentTarget.value)}
        onCompositionStart={(event) => {
          composingRef.current = true;
          textareaProps?.onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          composingRef.current = false;
          textareaProps?.onCompositionEnd?.(event);
        }}
        onKeyDown={(event) => {
          textareaProps?.onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            composingRef.current ||
            event.nativeEvent.isComposing ||
            event.keyCode === 229
          )
            return;
          onKeyDown(event);
        }}
      />
    );
    return showCount ? (
      <span className={textAreaWrapperClass}>
        {control}
        <span
          className={getTextAreaCountClasses({
            exceeded:
              textareaProps?.maxLength !== undefined &&
              value.length > textareaProps.maxLength,
          })}
        >
          {value.length}
          {textareaProps?.maxLength !== undefined
            ? ` / ${textareaProps.maxLength}`
            : null}
        </span>
      </span>
    ) : (
      control
    );
  },
);
PlainEditor.displayName = "PlainEditor";
