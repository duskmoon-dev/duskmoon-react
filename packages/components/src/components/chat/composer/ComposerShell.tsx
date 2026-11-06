import React, { forwardRef, useEffect, useRef } from "react";
import { Button } from "../../button";
import { cn } from "../../../utils";
import type {
  ChatComposerActionContext,
  ChatComposerAttachmentContext,
  ChatComposerCompletion,
  ChatComposerProps,
} from "../Chat.types";
import type { ComposerAttachmentSource } from "../ComposerAttachment.types";
import { CompletionList } from "./CompletionList";

export interface ComposerShellAttachment {
  id: number | string;
  file?: File;
  name?: string;
  previewUrl?: string;
  state?: string;
  status?: React.ReactNode;
  progress?: number;
  retry?: () => void;
  cancel?: () => void;
}

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

interface ComposerShellProps extends Omit<
  React.ComponentProps<"div">,
  "children" | "onSubmit"
> {
  editor: React.ReactNode;
  composerId: string;
  entries: readonly ComposerShellAttachment[];
  renderAttachment?: ChatComposerProps["renderAttachment"];
  removeAttachment: (id: number | string) => void;
  addAttachments: (files: File[], source: ComposerAttachmentSource) => void;
  onAttachmentsChange?: ChatComposerProps["onAttachmentsChange"];
  pickerRef: React.RefObject<HTMLInputElement | null>;
  accept?: string;
  multiple: boolean;
  disabled: boolean;
  busy: boolean;
  submitting: boolean;
  generating: boolean;
  eligible: boolean;
  completion?: ChatComposerProps["completion"];
  candidates: readonly ChatComposerCompletion[];
  active?: ChatComposerCompletion;
  showCompletion: boolean;
  selectCompletion: (item: ChatComposerCompletion) => void;
  visibleError: React.ReactNode;
  hasError: boolean;
  intakeEvents?: boolean;
  completionHeader?: React.ReactNode;
  completionStatus?: React.ReactNode;
  statusContent?: React.ReactNode;
  attachLabel: string;
  sendLabel: string;
  stopLabel: string;
  openAttachments: () => void;
  submit: () => Promise<void>;
  onStop?: () => void;
  children?: ChatComposerProps["children"];
}

/** Shared presentation; editors own their DOM, selection and composition. */
export const ComposerShell = forwardRef<HTMLDivElement, ComposerShellProps>(
  (
    {
      editor,
      composerId,
      entries,
      renderAttachment,
      removeAttachment,
      addAttachments,
      onAttachmentsChange,
      pickerRef,
      accept,
      multiple,
      disabled,
      busy,
      submitting,
      generating,
      eligible,
      completion,
      candidates,
      active,
      showCompletion,
      selectCompletion,
      visibleError,
      hasError,
      intakeEvents = true,
      completionHeader,
      completionStatus,
      statusContent,
      attachLabel,
      sendLabel,
      stopLabel,
      openAttachments,
      submit,
      onStop,
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={cn("chat-composer", className)}
      onPaste={(event) => {
        props.onPaste?.(event);
        if (
          !intakeEvents ||
          event.defaultPrevented ||
          disabled ||
          !onAttachmentsChange
        )
          return;
        const files = Array.from(event.clipboardData.files ?? []);
        if (files.length) addAttachments(files, "paste");
        // Leave the native text paste available, including mixed text + files.
      }}
      onDragOver={(event) => {
        props.onDragOver?.(event);
        if (
          intakeEvents &&
          !event.defaultPrevented &&
          !disabled &&
          onAttachmentsChange &&
          Array.from(event.dataTransfer.types).includes("Files")
        )
          event.preventDefault();
      }}
      onDrop={(event) => {
        props.onDrop?.(event);
        if (
          !intakeEvents ||
          event.defaultPrevented ||
          disabled ||
          !onAttachmentsChange
        )
          return;
        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length) {
          event.preventDefault();
          addAttachments(files, "drop");
        }
      }}
    >
      {entries.length > 0 ? (
        // Preserve list semantics when Core removes list markers.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul
          role="list"
          className="chat-composer-attachments"
          aria-label="Attachments"
        >
          {entries.map(
            ({
              file,
              id,
              name: entryName,
              previewUrl,
              state,
              status,
              progress,
              retry,
              cancel,
            }) => {
              const name = file?.name ?? entryName ?? "Attachment";
              return (
                <li
                  key={id}
                  className="chat-composer-attachment"
                  data-state={state}
                >
                  {renderAttachment && file ? (
                    <AttachmentContent
                      file={file}
                      renderAttachment={renderAttachment}
                      context={{
                        remove: () => removeAttachment(id),
                        disabled: disabled || !onAttachmentsChange,
                      }}
                    />
                  ) : (
                    <>
                      {previewUrl ? (
                        <img src={previewUrl} alt={name} />
                      ) : file ? (
                        <AttachmentPreview file={file} />
                      ) : null}
                      <div className="chat-composer-attachment-info">
                        <span className="chat-composer-filename" title={name}>
                          {name}
                        </span>
                        {status ? (
                          <span className="chat-composer-description">
                            {status}
                          </span>
                        ) : null}
                        {progress !== undefined ? (
                          <progress
                            value={progress}
                            max={1}
                            aria-label={`Preparing ${name}`}
                          />
                        ) : null}
                      </div>
                      {retry ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={disabled}
                          onClick={retry}
                          aria-label={`Retry ${name}`}
                        >
                          Retry
                        </Button>
                      ) : null}
                      {cancel ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={disabled}
                          onClick={cancel}
                          aria-label={`Cancel ${name}`}
                        >
                          Cancel
                        </Button>
                      ) : null}
                      {onAttachmentsChange ? (
                        <Button
                          type="button"
                          size="sm"
                          color="base"
                          appearance="ghost"
                          disabled={disabled}
                          aria-label={`Remove ${name}`}
                          onClick={() => removeAttachment(id)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </>
                  )}
                </li>
              );
            },
          )}
        </ul>
      ) : null}
      {editor}
      {completionHeader}
      {completionStatus}
      {showCompletion ? (
        <CompletionList
          composerId={composerId}
          label={completion?.label ?? "Suggestions"}
          candidates={candidates}
          activeId={active?.id}
          onSelect={selectCompletion}
        />
      ) : null}
      {statusContent}
      {hasError ? (
        <div
          id={`${composerId}-error`}
          role="alert"
          className="chat-composer-error chat-composer-status"
          data-state="error"
        >
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
                if (files.length > 0) addAttachments(files, "picker");
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
  ),
);
ComposerShell.displayName = "ComposerShell";
