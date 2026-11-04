import React, { forwardRef, useEffect, useRef } from "react";
import { Button } from "../../button";
import { cn } from "../../../utils";
import type {
  ChatComposerActionContext,
  ChatComposerAttachmentContext,
  ChatComposerCompletion,
  ChatComposerProps,
} from "../Chat.types";
import type { AttachmentEntry } from "./legacy";

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
  entries: readonly AttachmentEntry[];
  renderAttachment?: ChatComposerProps["renderAttachment"];
  removeAttachment: (id: number) => void;
  addAttachments: (files: File[]) => void;
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
    <div {...props} ref={ref} className={cn("chat-composer", className)}>
      {entries.length > 0 ? (
        // Preserve list semantics when Core removes list markers.
        // eslint-disable-next-line jsx-a11y/no-redundant-roles
        <ul
          role="list"
          className="chat-composer-attachments"
          aria-label="Attachments"
        >
          {entries.map(({ file, id }) => (
            <li key={id} className="chat-composer-attachment">
              {renderAttachment ? (
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
                  <AttachmentPreview file={file} />
                  <span className="chat-composer-filename" title={file.name}>
                    {file.name}
                  </span>
                  {onAttachmentsChange ? (
                    <Button
                      type="button"
                      size="sm"
                      color="base"
                      appearance="ghost"
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removeAttachment(id)}
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
      {editor}
      {showCompletion ? (
        <ul
          id={`${composerId}-completions`}
          role="listbox"
          aria-label={completion?.label ?? "Suggestions"}
          className="chat-composer-completions"
        >
          {candidates.map((item, index) => (
            <li
              key={item.id}
              id={`${composerId}-option-${index}`}
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
                if (files.length > 0) addAttachments(files);
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
