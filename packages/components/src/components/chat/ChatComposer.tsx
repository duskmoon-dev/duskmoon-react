import React, {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ChatComposerCompletion, ChatComposerProps } from "./Chat.types";
import { ComposerShell } from "./composer/ComposerShell";
import { PlainEditor } from "./composer/PlainEditor";
import type { PlainEditorHandle } from "./composer/PlainEditor";
import { completionOptionId } from "./composer/CompletionList";
import {
  legacyCompletion,
  legacyEligibility,
  legacySnapshot,
  moveLegacyCompletion,
  reconcileAttachments,
  retainUnsubmittedAttachments,
} from "./composer/legacy";
import type { AttachmentEntry } from "./composer/legacy";
import { validateComposerAttachmentIntake } from "./composer/attachments";
import type {
  ComposerAttachmentRejection,
  ComposerAttachmentSource,
} from "./ComposerAttachment.types";

/** Controlled prompts, attachments, and application-supplied completions. */
export const ChatComposer = forwardRef<HTMLDivElement, ChatComposerProps>(
  (
    {
      value,
      onValueChange,
      onSubmit,
      scope,
      attachments = [],
      onAttachmentsChange,
      accept,
      attachmentPolicy,
      onAttachmentRejected,
      multiple = true,
      allowAttachmentOnly = false,
      compact = false,
      addMenu,
      context,
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
    const editorRef = useRef<PlainEditorHandle>(null);
    const pickerRef = useRef<HTMLInputElement>(null);
    const mountedRef = useRef(false);
    const submittingRef = useRef(false);
    const revisionRef = useRef(0);
    const observedValueRef = useRef(value);
    const entriesRef = useRef<AttachmentEntry[]>([]);
    const nextEntryRef = useRef(0);
    // Store values, rather than the caller's object, to detect in-place changes too.
    const scopeRef = useRef({
      contextKey: scope?.contextKey,
      conversationId: scope?.conversationId,
    });
    const generationRef = useRef(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>();
    const [attachmentRejections, setAttachmentRejections] = useState<
      readonly ComposerAttachmentRejection[]
    >([]);
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
    const scopeChanged =
      scopeRef.current.contextKey !== scope?.contextKey ||
      scopeRef.current.conversationId !== scope?.conversationId;
    const generation = generationRef.current + (scopeChanged ? 1 : 0);
    const occurrences = reconcileAttachments(
      scopeChanged ? [] : entriesRef.current,
      attachments,
      nextEntryRef.current,
    );

    useLayoutEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    useLayoutEffect(() => {
      if (scopeChanged) {
        scopeRef.current = {
          contextKey: scope?.contextKey,
          conversationId: scope?.conversationId,
        };
        generationRef.current = generation;
        submittingRef.current = false;
        setSubmitting(false);
        setSubmitError(undefined);
        setAttachmentRejections([]);
        setActiveId(undefined);
        setDismissed(false);
        revisionRef.current++;
      }
    }, [scopeChanged, scope?.contextKey, scope?.conversationId, generation]);

    useLayoutEffect(() => {
      if (observedValueRef.current !== value) {
        revisionRef.current++;
        observedValueRef.current = value;
      }
      entriesRef.current = occurrences.entries;
      nextEntryRef.current = occurrences.nextId;
      latestRef.current = {
        value,
        onValueChange,
        attachments,
        onAttachmentsChange,
        onSubmitError,
        clearOnSubmit,
      };
    });

    const eligible = legacyEligibility({
      value,
      attachments,
      allowAttachmentOnly,
      canSubmit,
      disabled,
      busy,
      submitting,
    });
    const candidates = completion?.items ?? [];
    const { enabled, active } = legacyCompletion(candidates, activeId);
    const showCompletion = !disabled && !dismissed && candidates.length > 0;
    const visibleError =
      error ??
      submitError ??
      (attachmentRejections.length ? (
        <ul>
          {attachmentRejections.map((item, index) => (
            <li key={`${index}-${item.metadata.name}`}>
              {item.metadata.name}: {item.error.message}
            </li>
          ))}
        </ul>
      ) : undefined);
    const hasError =
      visibleError !== undefined &&
      visibleError !== null &&
      visibleError !== false;

    function openAttachments() {
      if (!disabled && onAttachmentsChange) pickerRef.current?.click();
    }

    function changeAttachments(files: File[]) {
      const next = reconcileAttachments(
        entriesRef.current,
        files,
        nextEntryRef.current,
      );
      entriesRef.current = next.entries;
      nextEntryRef.current = next.nextId;
      latestRef.current.attachments = files;
      onAttachmentsChange?.(files);
    }

    function intakeAttachments(
      files: File[],
      source: ComposerAttachmentSource,
    ) {
      if (disabled || !onAttachmentsChange) return;
      const result = validateComposerAttachmentIntake(
        files,
        latestRef.current.attachments.length,
        { ...attachmentPolicy, accept: attachmentPolicy?.accept ?? accept },
        source,
      );
      setAttachmentRejections(result.rejected);
      if (result.rejected.length) onAttachmentRejected?.(result.rejected);
      if (result.accepted.length)
        changeAttachments([
          ...latestRef.current.attachments,
          ...result.accepted,
        ]);
    }

    function removeAttachment(entryId: number) {
      if (disabled || !onAttachmentsChange) return;
      const index = entriesRef.current.findIndex(
        (entry) => entry.id === entryId,
      );
      if (index < 0) return;
      entriesRef.current.splice(index, 1);
      changeAttachments(
        attachments.filter((_, fileIndex) => fileIndex !== index),
      );
    }

    function selectCompletion(item: ChatComposerCompletion) {
      if (!completion || item.disabled || disabled) return;
      completion.onSelect(
        item,
        editorRef.current?.selection(value) ?? {
          value,
          selectionStart: value.length,
          selectionEnd: value.length,
        },
      );
      setDismissed(true);
      editorRef.current?.focus();
    }

    async function submit() {
      if (!eligible || submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      setSubmitError(undefined);
      const snapshot = legacySnapshot(
        value,
        attachments,
        revisionRef.current,
        entriesRef.current,
      );
      const submittedGeneration = generationRef.current;
      const isCurrent = () =>
        mountedRef.current && generationRef.current === submittedGeneration;
      try {
        const accepted = await onSubmit(snapshot.submission);
        if (!isCurrent() || accepted === false) return;
        const current = latestRef.current;
        if (current.clearOnSubmit) {
          if (revisionRef.current === snapshot.revision)
            current.onValueChange("");
          if (!isCurrent()) return;
          const retained = retainUnsubmittedAttachments(
            entriesRef.current,
            snapshot.entryIds,
          );
          if (retained.length !== entriesRef.current.length) {
            entriesRef.current = retained;
            current.onAttachmentsChange?.(retained.map((entry) => entry.file));
          }
        }
      } catch (cause) {
        if (!isCurrent()) return;
        setSubmitError("Unable to send message. Please try again.");
        latestRef.current.onSubmitError?.(cause);
      } finally {
        if (isCurrent()) {
          submittingRef.current = false;
          setSubmitting(false);
        }
      }
    }

    return (
      <ComposerShell
        {...props}
        ref={ref}
        className={className}
        composerId={id}
        compact={compact}
        addMenu={addMenu}
        context={context}
        entries={occurrences.entries}
        renderAttachment={renderAttachment}
        removeAttachment={(entryId) => {
          if (typeof entryId === "number") removeAttachment(entryId);
        }}
        addAttachments={intakeAttachments}
        onAttachmentsChange={onAttachmentsChange}
        pickerRef={pickerRef}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        busy={busy}
        submitting={submitting}
        generating={generating}
        eligible={eligible}
        completion={completion}
        candidates={candidates}
        active={active}
        showCompletion={showCompletion}
        selectCompletion={selectCompletion}
        dismissCompletion={() => setDismissed(true)}
        visibleError={visibleError}
        hasError={hasError}
        attachLabel={attachLabel}
        sendLabel={sendLabel}
        stopLabel={stopLabel}
        openAttachments={openAttachments}
        submit={submit}
        onStop={onStop}
        editor={
          <PlainEditor
            ref={editorRef}
            value={value}
            disabled={disabled}
            minRows={minRows}
            maxRows={maxRows}
            generation={generation}
            textareaProps={textareaProps}
            composerId={id}
            hasError={hasError}
            hasCompletion={!!completion}
            showCompletion={showCompletion}
            activeIndex={active ? candidates.indexOf(active) : -1}
            activeDescendant={
              showCompletion && active
                ? completionOptionId(id, active.id)
                : undefined
            }
            onChange={(nextValue) => {
              revisionRef.current++;
              observedValueRef.current = nextValue;
              setSubmitError(undefined);
              setDismissed(false);
              setActiveId(undefined);
              onValueChange(nextValue);
            }}
            onKeyDown={(event) => {
              if (showCompletion) {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setDismissed(true);
                  return;
                }
                if (
                  enabled.length > 0 &&
                  (event.key === "ArrowDown" || event.key === "ArrowUp")
                ) {
                  event.preventDefault();
                  setActiveId(
                    moveLegacyCompletion(
                      enabled,
                      active?.id,
                      event.key === "ArrowDown" ? 1 : -1,
                    ),
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
        }
      >
        {children}
      </ComposerShell>
    );
  },
);
ChatComposer.displayName = "Chat.Composer";
