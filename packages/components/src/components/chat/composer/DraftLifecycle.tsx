import React, { useId } from "react";
import type {
  ComposerDocumentUpdate,
  ComposerDraft,
  ComposerScope,
} from "../Composer.types";
import type { ComposerDraftAdapter } from "../ComposerDraft.types";
import type { ComposerAttachmentController } from "../ComposerAttachment.types";
import { useComposerDraft } from "./useComposerDraft";
import { PreservedDraft } from "./PreservedDraft";

interface Props {
  adapter: ComposerDraftAdapter;
  scope: ComposerScope;
  draftKey: string;
  generation: number;
  value: ComposerDocumentUpdate;
  attachments: ComposerAttachmentController;
  onDocumentChange: (value: ComposerDocumentUpdate) => void;
  disabled: boolean;
  compact?: boolean;
  children: (
    feedback: React.ReactNode,
    menuActions?: React.ReactNode,
  ) => React.ReactNode;
}

/** Host storage is optional; no autosave cadence or browser storage is assumed. */
export function DraftLifecycle({
  adapter,
  scope,
  draftKey,
  generation,
  value,
  attachments,
  onDocumentChange,
  disabled,
  compact = false,
  children,
}: Props) {
  const originId = `${useId()}-draft`;
  function restore(draft: ComposerDraft) {
    attachments.restore(draft.attachments);
    onDocumentChange({
      document: draft.document,
      revision: Math.max(value.revision, draft.revision) + 1,
      origin: "restore",
      originId,
    });
  }
  const { controller, snapshot } = useComposerDraft({
    adapter,
    scope,
    draftKey,
    instanceGeneration: generation,
    revision: value.revision,
    originId: value.originId,
    document: value.document,
    attachments: attachments.draftSnapshot(),
    onRestore: restore,
  });
  const blocked =
    disabled ||
    snapshot.saving ||
    snapshot.status === "idle" ||
    snapshot.status === "loading" ||
    snapshot.restorePending ||
    (snapshot.status === "incompatible" && !snapshot.overwriteAllowed) ||
    (snapshot.status === "error" && snapshot.errorOperation !== "save");
  const status =
    snapshot.status === "loading"
      ? "Loading stored draft…"
      : snapshot.saving
        ? "Saving draft…"
        : snapshot.lastSavedRevision === value.revision
          ? "Draft saved by host storage."
          : snapshot.loaded?.applied
            ? "Stored draft restored."
            : "Draft storage is provided by the host.";
  const feedback = (
    <>
      <div role="status" className={compact ? "sr-only" : undefined}>
        {status}
      </div>
      {snapshot.error ? <p role="alert">{snapshot.error.message}</p> : null}
      {snapshot.incompatible ? (
        <>
          <PreservedDraft
            input={snapshot.incompatible.input}
            reason={snapshot.incompatible.reason}
          />
          {!snapshot.overwriteAllowed ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (snapshot.incompatible)
                  controller.allowOverwrite(snapshot.incompatible);
              }}
            >
              Allow replacing this stored draft
            </button>
          ) : null}
        </>
      ) : null}
      {snapshot.loaded && !snapshot.loaded.applied ? (
        <>
          <PreservedDraft
            input={snapshot.loaded.draft}
            reason="A stored draft arrived after editing. Your current draft is preserved."
            state="pending"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (snapshot.loaded) restore(snapshot.loaded.draft);
            }}
          >
            Restore stored draft
          </button>
        </>
      ) : null}
    </>
  );
  const actions = compact ? (
    <>
      <button
        type="button"
        className="popover-menu-item"
        title={status}
        disabled={blocked}
        onClick={(event) => {
          void controller.save();
          event.currentTarget
            .closest<HTMLElement>("[popover]")
            ?.hidePopover?.();
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8" />
        </svg>
        <span>Save draft</span>
      </button>
      <button
        type="button"
        className="popover-menu-item"
        title="Reload stored draft"
        disabled={disabled || snapshot.status === "loading" || snapshot.saving}
        onClick={(event) => {
          void controller.reload();
          event.currentTarget
            .closest<HTMLElement>("[popover]")
            ?.hidePopover?.();
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7" />
        </svg>
        <span>Reload stored draft</span>
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        disabled={blocked}
        onClick={() => void controller.save()}
      >
        Save draft
      </button>
      <button
        type="button"
        disabled={disabled || snapshot.status === "loading" || snapshot.saving}
        onClick={() => void controller.reload()}
      >
        Reload stored draft
      </button>
    </>
  );
  return compact
    ? children(feedback, actions)
    : children(
        <div className="chat-composer-status" aria-label="Draft storage">
          {feedback}
          {actions}
        </div>,
      );
}
