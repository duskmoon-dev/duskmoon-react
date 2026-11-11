import React, {
  forwardRef,
  useId,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ChatSessionComposerProps } from "../ChatSessionComposer.types";
import type { ChatComposerCompletion } from "../Chat.types";
import type {
  ComposerEditorAdapterProps,
  ComposerEditorHandle,
} from "./EditorAdapter.types";
import type {
  ComposerProviderContext,
  ComposerProviderSelection,
} from "../ComposerProvider.types";
import type { ComposerAttachmentSource } from "../ComposerAttachment.types";
import type { ComposerProviderCandidate } from "../Composer.types";
import { ComposerShell } from "./ComposerShell";
import { completionOptionId } from "./CompletionList";
import { useComposerAttachments } from "./useComposerAttachments";
import { useComposerProviders } from "./useComposerProviders";
import { useComposerSession } from "./useComposerSession";
import { composerActionEligibility, sameComposerScope } from "./session";
import {
  migrateLegacyComposerDocument,
  readComposerDocument,
} from "./document";
import { isPlainComposerDocument } from "./PlainSemanticEditor";
import { PreservedDraft } from "./PreservedDraft";
import { DraftLifecycle } from "./DraftLifecycle";

interface Props extends ChatSessionComposerProps {
  Editor: React.ComponentType<
    ComposerEditorAdapterProps & React.RefAttributes<ComposerEditorHandle>
  >;
  structured: boolean;
}

/** One shell/lifecycle for semantic plain and optional rich editor adapters. */
export const SemanticComposer = forwardRef<ComposerEditorHandle, Props>(
  (
    {
      Editor,
      structured,
      value,
      onDocumentChange,
      scope,
      draftKey,
      host,
      runtime = { status: "idle" },
      policy,
      options,
      draftAdapter,
      attachmentOptions,
      providers = [],
      onProviderInvoke,
      disabled = false,
      busy = false,
      canSubmit = true,
      allowAttachmentOnly = false,
      compact = false,
      addMenu,
      context: composerContext,
      onStop,
      label = "Message",
      attachLabel = "Attach files",
      stopLabel = "Stop",
      minRows = 1,
      maxRows = 6,
      error,
      children,
      className,
      onPaste,
      onDrop,
      onPasteCapture,
      onDropCapture,
      onKeyDown,
      onKeyDownCapture,
      ...rootProps
    },
    forwardedRef,
  ) => {
    const id = useId();
    const editor = useRef<ComposerEditorHandle>(null);
    const picker = useRef<HTMLInputElement>(null);
    const [readiness, setReadiness] = useState({ generation: 0, ready: false });
    const [editorFailure, setEditorFailure] = useState<{
      generation: number;
      error: Error;
    }>();
    const [localFailure, setLocalFailure] = useState<{
      generation: number;
      message: string;
    }>();
    const [selection, setSelection] =
      useState<ComposerProviderSelection | null>(null);
    const observed = useRef({ scope: { ...scope }, draftKey, generation: 0 });
    const changedScope =
      !sameComposerScope(observed.current.scope, scope) ||
      observed.current.draftKey !== draftKey;
    const generation = observed.current.generation + (changedScope ? 1 : 0);
    const alive = useRef(false);
    useLayoutEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
      };
    }, []);
    useLayoutEffect(() => {
      if (changedScope)
        observed.current = { scope: { ...scope }, draftKey, generation };
    }, [
      scope,
      scope.contextKey,
      scope.conversationId,
      draftKey,
      changedScope,
      generation,
    ]);
    const ready = readiness.generation === generation && readiness.ready;
    const editorError =
      editorFailure?.generation === generation
        ? editorFailure.error
        : undefined;
    const localError =
      localFailure?.generation === generation
        ? localFailure.message
        : undefined;
    function setLocalError(message?: string, origin = generation) {
      if (alive.current && observed.current.generation === origin)
        setLocalFailure(message ? { generation: origin, message } : undefined);
    }
    const read = readComposerDocument(value.document);
    const document =
      read.status === "compatible"
        ? read.value
        : migrateLegacyComposerDocument("");
    const compatible =
      read.status === "compatible" &&
      (structured || isPlainComposerDocument(document));
    const editAvailable = compatible && !editorError;
    const attachments = useComposerAttachments({
      scope,
      ...attachmentOptions,
      draftKey,
      prepare:
        attachmentOptions?.prepare ??
        (() => {
          throw new Error("Attachment preparation is unavailable");
        }),
    });
    const attachmentsCurrent =
      sameComposerScope(attachments.scope, scope) &&
      attachments.draftKey === draftKey;
    const pendingFiles =
      attachmentsCurrent &&
      attachments.entries.some((entry) => entry.state.status !== "ready");
    const sendable =
      pendingFiles || !attachmentsCurrent
        ? []
        : attachments.controller.sendableSnapshot();
    const context = {
      scope,
      draftKey,
      document,
      revision: value.revision,
      instanceGeneration: generation,
      runtime,
      policy,
      options,
      host,
      attachments: sendable,
      attachmentsPending: pendingFiles,
      disabled: disabled || !editAvailable || !ready,
      busy,
      canSubmit,
      allowAttachmentOnly,
      onAccepted: () => {
        onDocumentChange({
          document: migrateLegacyComposerDocument(""),
          revision: value.revision + 1,
          origin: "clear",
          originId: id,
        });
        setSelection(null);
      },
      onAcceptedAttachments: (accepted: typeof sendable) => {
        for (const entry of accepted)
          attachments.controller.remove(entry.entryId);
      },
    };
    const session = useComposerSession(context);
    const action = composerActionEligibility(context);
    const recovery = useSyncExternalStore(
      host.recovery.subscribe,
      host.recovery.getSnapshot,
      host.recovery.getSnapshot,
    );
    const candidateDisabledReason = useCallback(
      (candidate: ComposerProviderCandidate) => {
        if (
          !structured &&
          candidate.action.type === "insert" &&
          (candidate.action.command ||
            candidate.action.content.some((node) => node.type !== "text"))
        )
          return "Requires the rich editor";
        if (candidate.action.type === "invoke" && !onProviderInvoke)
          return "Host action unavailable";
        return undefined;
      },
      [structured, onProviderInvoke],
    );
    const providerContext: ComposerProviderContext = {
      document,
      documentRevision: value.revision,
      scope,
      instanceGeneration: generation,
      selection: changedScope ? null : selection,
      providers: disabled || !editAvailable ? [] : providers,
      candidateDisabledReason,
    };
    const completion = useComposerProviders(providerContext);
    const popup = completion.snapshot.status !== "idle";
    const candidates: ChatComposerCompletion[] = completion.snapshot.items.map(
      (item) => {
        const provider = providers.find(
          (entry) => entry.providerId === item.providerId,
        );
        const reason =
          item.candidate.disabledReason ??
          candidateDisabledReason(item.candidate);
        return {
          id: item.id,
          label: item.candidate.label,
          icon: provider?.icon,
          sourceLabel: provider?.sourceLabel,
          description: reason ?? item.candidate.description,
          disabled: reason !== undefined,
          group:
            item.candidate.group ??
            completion.snapshot.groups.find(
              (group) => group.providerId === item.providerId,
            )?.label,
        };
      },
    );
    const active = candidates.find(
      (item) => item.id === completion.snapshot.activeId && !item.disabled,
    );
    const showCompletion = popup && candidates.length > 0;
    const visibleError = error ?? localError ?? session.snapshot.error?.message;
    const hasError =
      visibleError !== undefined &&
      visibleError !== null &&
      visibleError !== false;
    useImperativeHandle(
      forwardedRef,
      () => ({
        focus: () => editor.current?.focus(),
        selection: () => editor.current?.selection() ?? null,
        insertReference: (node) => {
          if (!editor.current)
            throw new Error("Editor unavailable; draft preserved");
          editor.current.insertReference(node);
        },
        insertQuote: (node) => {
          if (!editor.current)
            throw new Error("Editor unavailable; draft preserved");
          editor.current.insertQuote(node);
        },
        claimCommand: (command, source) => {
          if (!editor.current)
            throw new Error("Editor unavailable; draft preserved");
          editor.current.claimCommand(command, source);
        },
        insertText: (text) => {
          if (!editor.current)
            throw new Error("Editor unavailable; draft preserved");
          editor.current.insertText(text);
        },
        applyProvider: (effect) =>
          editor.current?.applyProvider(effect) ?? false,
      }),
      [],
    );
    function intake(files: File[], source: ComposerAttachmentSource) {
      if (!disabled && runtime.status !== "read_only" && attachmentOptions)
        attachments.controller.intake(files, source);
    }
    async function submit() {
      try {
        await session.controller.submit();
      } catch (cause) {
        setLocalError(
          cause instanceof Error
            ? cause.message
            : "Unable to retain submission recovery",
        );
      }
    }
    function selectCandidate(item: ChatComposerCompletion) {
      if (item.disabled) return;
      const effect = completion.controller.select(item.id, {
        ...providerContext,
        selection: editor.current?.selection() ?? null,
      });
      if (!effect) return;
      if (effect.action.type === "insert") {
        if (!editor.current?.applyProvider(effect))
          setLocalError(
            "The draft or selection changed. Choose a suggestion again.",
          );
      } else if (effect.action.type === "invoke" && onProviderInvoke) {
        const origin = generation;
        Promise.resolve()
          .then(() => onProviderInvoke(effect))
          .catch((cause) => {
            setLocalError(
              cause instanceof Error ? cause.message : "Host action failed",
              origin,
            );
          });
      }
      editor.current?.focus();
    }
    const compactImages =
      compact &&
      attachmentsCurrent &&
      attachments.entries.length > 0 &&
      attachments.entries.every(
        (entry) =>
          entry.state.status === "ready" &&
          entry.metadata.mediaType.startsWith("image/") &&
          !!attachments.controller.previewUrl(entry.entryId),
      );
    return (
      <ComposerShell
        {...rootProps}
        className={className}
        composerId={id}
        compact={compact}
        addMenu={addMenu}
        context={composerContext}
        entries={(attachmentsCurrent ? attachments.entries : []).map(
          (entry) => ({
            id: entry.entryId,
            name: entry.metadata.name,
            previewUrl: attachments.controller.previewUrl(entry.entryId),
            state:
              entry.state.status === "preparing"
                ? "validating"
                : entry.state.status,
            status:
              entry.state.status === "error"
                ? entry.state.error.message
                : entry.state.status === "reattach"
                  ? "Select this file again to restore it"
                  : entry.state.status === "ready"
                    ? compactImages
                      ? undefined
                      : "Ready"
                    : entry.state.status,
            ...(entry.state.status === "preparing" ||
            entry.state.status === "uploading"
              ? {
                  progress: entry.state.progress,
                  cancel: () => attachments.controller.cancel(entry.entryId),
                }
              : {}),
            ...((entry.state.status === "error" ||
              entry.state.status === "cancelled") &&
            attachments.controller.file(entry.entryId)
              ? {
                  retry: () => {
                    attachments.controller.retry(entry.entryId);
                  },
                }
              : {}),
          }),
        )}
        removeAttachment={(entryId) =>
          attachments.controller.remove(String(entryId))
        }
        addAttachments={intake}
        onAttachmentsChange={attachmentOptions ? () => {} : undefined}
        intakeEvents={false}
        onKeyDownCapture={(event) => {
          onKeyDownCapture?.(event);
          onKeyDown?.(event);
        }}
        onPasteCapture={(event) => {
          onPasteCapture?.(event);
          onPaste?.(event);
          if (!event.defaultPrevented)
            intake(Array.from(event.clipboardData.files ?? []), "paste");
        }}
        onDropCapture={(event) => {
          onDropCapture?.(event);
          onDrop?.(event);
          if (
            !event.defaultPrevented &&
            attachmentOptions &&
            event.dataTransfer.files.length
          ) {
            event.preventDefault();
            intake(Array.from(event.dataTransfer.files), "drop");
          }
        }}
        onDragOver={(event) => {
          rootProps.onDragOver?.(event);
          if (
            !event.defaultPrevented &&
            attachmentOptions &&
            event.dataTransfer.types.includes("Files")
          )
            event.preventDefault();
        }}
        pickerRef={picker}
        accept={attachmentOptions?.policy?.accept}
        multiple
        disabled={disabled || runtime.status === "read_only"}
        busy={busy}
        submitting={session.snapshot.submitting}
        generating={runtime.status === "running"}
        eligible={action.allowed && !session.snapshot.submitting}
        candidates={candidates}
        active={active}
        showCompletion={showCompletion}
        selectCompletion={selectCandidate}
        dismissCompletion={() => completion.controller.dismiss()}
        completionHeader={
          completion.snapshot.breadcrumbs.length ? (
            <nav
              aria-label="Suggestion folders"
              className="chat-composer-breadcrumb"
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => completion.controller.back(0)}
              >
                All results
              </button>
              {completion.snapshot.breadcrumbs.map((crumb, index) => (
                <button
                  type="button"
                  key={crumb.refId}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => completion.controller.back(index + 1)}
                >
                  {crumb.label}
                </button>
              ))}
              <span className="chat-composer-hint">
                Alt+Left returns to the parent folder.
              </span>
            </nav>
          ) : null
        }
        completionStatus={
          popup && completion.snapshot.status !== "ready" ? (
            <div role="status" className="chat-composer-status">
              {completion.snapshot.status === "loading"
                ? "Loading suggestions…"
                : completion.snapshot.status === "empty"
                  ? "No suggestions"
                  : (completion.snapshot.error?.message ??
                    "Some suggestions could not be loaded")}
              {completion.snapshot.status === "error" ? (
                <button
                  type="button"
                  onClick={() => completion.controller.retry()}
                >
                  Retry suggestions
                </button>
              ) : null}
            </div>
          ) : null
        }
        visibleError={visibleError}
        hasError={hasError}
        statusContent={
          <>
            {attachmentsCurrent && attachments.rejections.length ? (
              <div
                role="alert"
                className="chat-composer-status"
                data-state="error"
              >
                {attachments.rejections.map((item, index) => (
                  <p key={`${index}-${item.metadata.name}`}>
                    {item.metadata.name}: {item.error.message}
                  </p>
                ))}
                <button
                  type="button"
                  onClick={() => attachments.controller.clearRejections()}
                >
                  Dismiss attachment errors
                </button>
              </div>
            ) : null}
            {recovery
              .filter(
                (attempt) =>
                  sameComposerScope(attempt.snapshot.scope, scope) &&
                  (attempt.status === "unknown" ||
                    attempt.status === "pending"),
              )
              .map((attempt) =>
                compact && attempt.status === "pending" ? (
                  <p
                    key={attempt.snapshot.clientSubmissionId}
                    role="status"
                    className="sr-only"
                    data-state="pending"
                  >
                    Awaiting admission
                  </p>
                ) : (
                  <details
                    key={attempt.snapshot.clientSubmissionId}
                    className="chat-composer-status"
                    data-state={attempt.status}
                  >
                    <summary>
                      {attempt.status === "unknown"
                        ? "Submission outcome unknown — draft retained"
                        : "Awaiting admission"}
                    </summary>
                    <p>{attempt.snapshot.clientSubmissionId}</p>
                    {attempt.receipt?.outcome === "unknown" ? (
                      <p>{attempt.receipt.error.message}</p>
                    ) : null}
                    {host.reconcile ? (
                      <button
                        type="button"
                        onClick={() => {
                          void session.controller
                            .reconcile(attempt.snapshot.clientSubmissionId)
                            .catch((cause) =>
                              setLocalError(String(cause), generation),
                            );
                        }}
                      >
                        Check submission status
                      </button>
                    ) : null}
                    {attempt.status === "unknown" && host.authorizeRetry ? (
                      <button
                        type="button"
                        onClick={() => {
                          void session.controller
                            .retry(attempt.snapshot.clientSubmissionId)
                            .catch((cause) =>
                              setLocalError(String(cause), generation),
                            );
                        }}
                      >
                        Request authorized retry
                      </button>
                    ) : null}
                    <PreservedDraft
                      input={attempt.snapshot.document}
                      reason="Submitted snapshot"
                      state={
                        attempt.status === "unknown" ? "unknown" : "pending"
                      }
                    />
                  </details>
                ),
              )}
            {session.snapshot.recoveryFailures?.map((attempt) => (
              <PreservedDraft
                key={attempt.snapshot.clientSubmissionId}
                input={attempt}
                reason="The host could not retain this submission. Export its recovery record before leaving."
              />
            ))}
            {session.snapshot.lastReceipt?.outcome === "accepted" ? (
              <div
                role="status"
                className={compact ? "sr-only" : "chat-composer-status"}
              >
                {session.snapshot.lastReceipt.operation === "command"
                  ? "Command completed"
                  : `Admitted: ${session.snapshot.lastReceipt.delivery} (${session.snapshot.lastReceipt.persistence})`}
              </div>
            ) : null}
          </>
        }
        renderFooter={(renderToolbar) =>
          draftAdapter && attachmentsCurrent && read.status === "compatible" ? (
            <DraftLifecycle
              key={`draft-${generation}`}
              compact={compact}
              adapter={draftAdapter}
              scope={scope}
              draftKey={draftKey}
              generation={generation}
              value={value}
              attachments={attachments.controller}
              onDocumentChange={onDocumentChange}
              disabled={disabled || runtime.status === "read_only"}
            >
              {(feedback, actions) => (
                <>
                  {feedback}
                  {renderToolbar(actions)}
                </>
              )}
            </DraftLifecycle>
          ) : (
            renderToolbar()
          )
        }
        attachLabel={attachLabel}
        sendLabel={action.label}
        stopLabel={stopLabel}
        openAttachments={() => {
          if (!disabled && attachmentOptions) picker.current?.click();
        }}
        submit={submit}
        onStop={onStop}
        editor={
          editAvailable ? (
            <Editor
              key={generation}
              ref={editor}
              value={value}
              instanceGeneration={generation}
              onReady={(ready) => setReadiness({ generation, ready })}
              onError={(error) => setEditorFailure({ generation, error })}
              onSelectionChange={setSelection}
              onChange={(update) => {
                setLocalError(undefined);
                onDocumentChange(update);
              }}
              disabled={disabled || runtime.status === "read_only"}
              id={id}
              label={label}
              minRows={minRows}
              maxRows={maxRows}
              invalid={hasError}
              describedBy={hasError ? `${id}-error` : undefined}
              hasSuggestions={providers.length > 0}
              controls={showCompletion ? `${id}-completions` : undefined}
              activeDescendant={
                active && showCompletion
                  ? completionOptionId(id, active.id)
                  : undefined
              }
              onKeyDown={(event) => {
                if (
                  event.defaultPrevented ||
                  event.nativeEvent.isComposing ||
                  event.keyCode === 229
                )
                  return;
                if (popup) {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    completion.controller.dismiss();
                    return;
                  }
                  if (
                    event.key === "ArrowLeft" &&
                    event.altKey &&
                    completion.snapshot.breadcrumbs.length
                  ) {
                    event.preventDefault();
                    completion.controller.back();
                    return;
                  }
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    completion.controller.move(
                      event.key === "ArrowDown" ? 1 : -1,
                    );
                    return;
                  }
                  if (
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey &&
                    !event.shiftKey &&
                    (event.key === "Enter" || event.key === "Tab")
                  ) {
                    event.preventDefault();
                    if (active) selectCandidate(active);
                    return;
                  }
                }
                const gesture =
                  policy?.shortcut === "enter"
                    ? !event.ctrlKey &&
                      !event.metaKey &&
                      !event.shiftKey &&
                      !event.altKey
                    : event.ctrlKey || event.metaKey;
                if (event.key === "Enter" && gesture) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
          ) : (
            <PreservedDraft
              input={value.document}
              reason={
                editorError?.message ??
                (read.status === "incompatible"
                  ? read.reason
                  : "This draft requires the optional rich editor.")
              }
            />
          )
        }
      >
        {children}
      </ComposerShell>
    );
  },
);
SemanticComposer.displayName = "SemanticComposer";
