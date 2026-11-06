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
  return (
    <div className="chat-composer-status" aria-label="Draft storage">
      <div role="status">
        {snapshot.status === "loading"
          ? "Loading stored draft…"
          : snapshot.saving
            ? "Saving draft…"
            : snapshot.lastSavedRevision === value.revision
              ? "Draft saved by host storage."
              : snapshot.loaded?.applied
                ? "Stored draft restored."
                : "Draft storage is provided by the host."}
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
    </div>
  );
}
