import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../button";
import { Input } from "../input";
import { cn } from "../../utils";
import type {
  ChatComposerActionContext,
  ChatComposerAttachmentContext,
  ChatComposerCompletion,
  ChatComposerProps,
} from "./Chat.types";

type AttachmentEntry = { file: File; id: number };

function AttachmentPreview({ file }: { file: File }) {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = imageRef.current;
    if (!image || !file.type.startsWith("image/") || !URL.createObjectURL)
      return;
    const objectUrl = URL.createObjectURL(file);
    image.src = objectUrl;
    image.hidden = false;
    return () => {
      image.hidden = true;
      image.removeAttribute("src");
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  return file.type.startsWith("image/") ? (
    <img ref={imageRef} alt={file.name} hidden />
  ) : null;
}

function AttachmentContent({
  file,
  renderAttachment,
  context,
}: {
  file: File;
  renderAttachment: NonNullable<ChatComposerProps["renderAttachment"]>;
  context: ChatComposerAttachmentContext;
}) {
  return renderAttachment(file, context);
}

function ExtraActions({
  children,
  context,
}: {
  children: ChatComposerProps["children"];
  context: ChatComposerActionContext;
}) {
  return typeof children === "function" ? children(context) : children;
}

/** Controlled prompts, attachments, and application-supplied completions. */
export const ChatComposer = forwardRef<HTMLDivElement, ChatComposerProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      attachments = [],
      onAttachmentsChange,
      accept,
      multiple = true,
      allowAttachmentOnly = false,
      disabled = false,
      busy = false,
      generating = false,
      canSubmit = true,
      onStop,
      error,
      onSubmitError,
      clearOnSubmit = true,
      completion,
      minRows = 1,
      maxRows = 6,
      textareaProps,
      attachLabel = "Attach files",
      sendLabel = "Send",
      stopLabel = "Stop",
      renderAttachment,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const pickerRef = useRef<HTMLInputElement>(null);
    const mountedRef = useRef(false);
    const composingRef = useRef(false);
    const submittingRef = useRef(false);
    const revisionRef = useRef(0);
    const observedValueRef = useRef(value);
    const entriesRef = useRef<AttachmentEntry[]>([]);
    const nextEntryRef = useRef(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>();
    const [activeId, setActiveId] = useState<string>();
    const [dismissed, setDismissed] = useState(false);
    const latestRef = useRef({
      value,
      onValueChange,
      attachments,
      onAttachmentsChange,
      onSubmitError,
      clearOnSubmit,
    });

    function reconcileEntries(files: File[]) {
      const previous = [...entriesRef.current];
      entriesRef.current = files.map((file) => {
        const index = previous.findIndex((entry) => entry.file === file);
        if (index < 0) return { file, id: nextEntryRef.current++ };
        return previous.splice(index, 1)[0];
      });
    }

    useLayoutEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    useLayoutEffect(() => {
      if (observedValueRef.current !== value) {
        revisionRef.current++;
        observedValueRef.current = value;
      }
      reconcileEntries(attachments);
      latestRef.current = {
        value,
        onValueChange,
        attachments,
        onAttachmentsChange,
        onSubmitError,
        clearOnSubmit,
      };
    });

    const minimumRows = Math.max(1, Math.floor(minRows));
    const maximumRows = Math.max(minimumRows, Math.floor(maxRows));
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

    const eligible =
      canSubmit &&
      !disabled &&
      !busy &&
      !submitting &&
      (value.trim().length > 0 ||
        (allowAttachmentOnly && attachments.length > 0));
    const candidates = completion?.items ?? [];
    const enabledCandidates = candidates.filter((item) => !item.disabled);
    const active =
      enabledCandidates.find((item) => item.id === activeId) ??
      enabledCandidates[0];
    const showCompletion = !disabled && !dismissed && candidates.length > 0;
    const visibleError = error ?? submitError;
    const hasError =
      visibleError !== undefined &&
      visibleError !== null &&
      visibleError !== false;

    function openAttachments() {
      if (!disabled && onAttachmentsChange) pickerRef.current?.click();
    }

    function changeAttachments(files: File[]) {
      reconcileEntries(files);
      latestRef.current.attachments = files;
      onAttachmentsChange?.(files);
    }

    function removeAttachment(index: number) {
      if (disabled || !onAttachmentsChange) return;
      entriesRef.current.splice(index, 1);
      changeAttachments(
        attachments.filter((_, fileIndex) => fileIndex !== index),
      );
    }

    function selectCompletion(item: ChatComposerCompletion) {
      if (!completion || item.disabled || disabled) return;
      const editor = editorRef.current;
      completion.onSelect(item, {
        value,
        selectionStart: editor?.selectionStart ?? value.length,
        selectionEnd: editor?.selectionEnd ?? value.length,
      });
      setDismissed(true);
      editor?.focus();
    }

    async function submit() {
      if (!eligible || submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError(undefined);
      const snapshot = { value, files: [...attachments] };
      const submittedRevision = revisionRef.current;
      const submittedEntries = new Set(
        entriesRef.current.map((entry) => entry.id),
      );
      try {
        const accepted = await onSubmit(snapshot);
        if (!mountedRef.current || accepted === false) return;
        const current = latestRef.current;
        if (current.clearOnSubmit) {
          if (revisionRef.current === submittedRevision)
            current.onValueChange("");
          const retained = entriesRef.current.filter(
            (entry) => !submittedEntries.has(entry.id),
          );
          if (retained.length !== entriesRef.current.length) {
            entriesRef.current = retained;
            current.onAttachmentsChange?.(retained.map((entry) => entry.file));
          }
        }
      } catch (cause) {
        if (!mountedRef.current) return;
        setSubmitError("Unable to send message. Please try again.");
        latestRef.current.onSubmitError?.(cause);
      } finally {
        submittingRef.current = false;
        if (mountedRef.current) setSubmitting(false);
      }
    }

    return (
      <div {...props} ref={ref} className={cn("chat-composer", className)}>
        {attachments.length > 0 ? (
          <ul className="chat-composer-attachments" aria-label="Attachments">
            {attachments.map((file, index) => (
              <li key={index} className="chat-composer-attachment">
                {renderAttachment ? (
                  <AttachmentContent
                    file={file}
                    renderAttachment={renderAttachment}
                    context={{
                      remove: () => removeAttachment(index),
                      disabled: disabled || !onAttachmentsChange,
                    }}
                  />
                ) : (
                  <>
                    <AttachmentPreview file={file} />
                    <span className="chat-composer-filename">{file.name}</span>
                    {onAttachmentsChange ? (
                      <Button
                        type="button"
                        size="sm"
                        color="base"
                        appearance="ghost"
                        disabled={disabled}
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeAttachment(index)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <Input.TextArea
          {...textareaProps}
          ref={editorRef}
          className={cn("chat-composer-editor", textareaProps?.className)}
          value={value}
          disabled={disabled}
          rows={minimumRows}
          resize="none"
          aria-label={
            textareaProps?.["aria-label"] ??
            (textareaProps?.["aria-labelledby"] ? undefined : "Message")
          }
          aria-describedby={
            cn(
              textareaProps?.["aria-describedby"],
              hasError && `${id}-error`,
            ) || undefined
          }
          aria-invalid={hasError ? true : textareaProps?.["aria-invalid"]}
          aria-controls={showCompletion ? `${id}-completions` : undefined}
          aria-autocomplete={completion ? "list" : undefined}
          aria-haspopup={completion ? "listbox" : undefined}
          aria-activedescendant={
            showCompletion && active
              ? `${id}-option-${candidates.indexOf(active)}`
              : undefined
          }
          onChange={(event) => {
            revisionRef.current++;
            observedValueRef.current = event.currentTarget.value;
            setSubmitError(undefined);
            setDismissed(false);
            setActiveId(undefined);
            onValueChange(event.currentTarget.value);
          }}
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
            if (showCompletion) {
              if (event.key === "Escape") {
                event.preventDefault();
                setDismissed(true);
                return;
              }
              if (
                enabledCandidates.length > 0 &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
              ) {
                event.preventDefault();
                const position = enabledCandidates.findIndex(
                  (item) => item.id === active?.id,
                );
                const direction = event.key === "ArrowDown" ? 1 : -1;
                setActiveId(
                  enabledCandidates[
                    (position + direction + enabledCandidates.length) %
                      enabledCandidates.length
                  ].id,
                );
                return;
              }
              if (
                active &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !event.shiftKey &&
                (event.key === "Enter" || event.key === "Tab")
              ) {
                event.preventDefault();
                selectCompletion(active);
                return;
              }
            }
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        {showCompletion ? (
          <ul
            id={`${id}-completions`}
            role="listbox"
            aria-label={completion?.label ?? "Suggestions"}
            className="chat-composer-completions"
          >
            {candidates.map((item, index) => (
              <li
                key={item.id}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={item.id === active?.id}
                aria-disabled={item.disabled || undefined}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectCompletion(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectCompletion(item);
                  }
                }}
              >
                <span>{item.label}</span>
                {item.description ? (
                  <span className="chat-composer-description">
                    {item.description}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {hasError ? (
          <div id={`${id}-error`} role="alert" className="chat-composer-error">
            {visibleError}
          </div>
        ) : null}
        <div className="chat-composer-actions">
          {onAttachmentsChange ? (
            <>
              <input
                ref={pickerRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                hidden
                aria-label={attachLabel}
                onChange={(event) => {
                  const files = Array.from(event.currentTarget.files ?? []);
                  event.currentTarget.value = "";
                  if (files.length > 0)
                    changeAttachments([...attachments, ...files]);
                }}
              />
              <Button
                type="button"
                color="base"
                appearance="ghost"
                disabled={disabled}
                onClick={openAttachments}
              >
                {attachLabel}
              </Button>
            </>
          ) : null}
          <ExtraActions
            context={{
              submit: () => {
                void submit();
              },
              submitting,
              canSubmit: eligible,
              disabled,
              generating,
              openAttachments,
            }}
          >
            {children}
          </ExtraActions>
          {generating && onStop ? (
            <Button type="button" disabled={disabled} onClick={onStop}>
              {stopLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            color="primary"
            disabled={!eligible}
            aria-busy={busy || submitting || undefined}
            onClick={() => {
              void submit();
            }}
          >
            {sendLabel}
          </Button>
        </div>
      </div>
    );
  },
);

ChatComposer.displayName = "Chat.Composer";
