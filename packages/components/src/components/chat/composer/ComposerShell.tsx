import React, { forwardRef, useEffect, useRef, useState } from "react";
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
    <img
      ref={imageRef}
      className="chat-composer-preview"
      alt={file.name}
      hidden
    />
  ) : null;
}

function ComposerIcon({
  action,
}: {
  action: "attach" | "send" | "stop" | "remove" | "retry";
}) {
  return (
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
      {action === "attach" ? (
        <path d="M12 5v14M5 12h14" />
      ) : action === "send" ? (
        <path d="m5 12 7-7 7 7M12 5v14" />
      ) : action === "stop" ? (
        <rect
          x="6"
          y="6"
          width="12"
          height="12"
          rx="1"
          fill="currentColor"
          stroke="none"
        />
      ) : action === "retry" ? (
        <path d="M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7" />
      ) : (
        <path d="m6 6 12 12M6 18 18 6" />
      )}
    </svg>
  );
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
  compact?: boolean;
  addMenu?: React.ReactNode;
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
  dismissCompletion?: () => void;
  visibleError: React.ReactNode;
  hasError: boolean;
  intakeEvents?: boolean;
  completionHeader?: React.ReactNode;
  completionStatus?: React.ReactNode;
  statusContent?: React.ReactNode;
  renderFooter?: (
    renderToolbar: (menuContent?: React.ReactNode) => React.ReactNode,
  ) => React.ReactNode;
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
      compact = false,
      addMenu,
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
      dismissCompletion,
      visibleError,
      hasError,
      intakeEvents = true,
      completionHeader,
      completionStatus,
      statusContent,
      renderFooter,
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
  ) => {
    const [addOpen, setAddOpen] = useState(false);
    const addId = `${composerId}-add`;
    const addAnchor = `--composer-add-${composerId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const completionAnchor = `--composer-completions-${composerId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const thumbnails =
      compact &&
      entries.length > 0 &&
      !renderAttachment &&
      entries.every(
        ({ file, previewUrl, state, status, progress, retry, cancel }) =>
          (previewUrl ||
            (file?.type.startsWith("image/") &&
              typeof URL.createObjectURL === "function")) &&
          (!state || state === "ready") &&
          !status &&
          progress === undefined &&
          !retry &&
          !cancel,
      );
    const attachmentAction = onAttachmentsChange ? (
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
          size="sm"
          shape="circle"
          aria-label={attachLabel}
          title={attachLabel}
          disabled={disabled}
          onClick={openAttachments}
        >
          <ComposerIcon action="attach" />
        </Button>
      </>
    ) : null;
    const actionContent = (
      <>
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
        {generating && onStop && (!compact || !eligible) ? (
          <Button
            type="button"
            color={compact ? "primary" : undefined}
            size="sm"
            shape="circle"
            aria-label={stopLabel}
            title={stopLabel}
            disabled={disabled}
            onClick={onStop}
          >
            <ComposerIcon action="stop" />
          </Button>
        ) : null}
        {!compact || !generating || !onStop || eligible ? (
          <Button
            type="button"
            color="primary"
            size="sm"
            shape="circle"
            aria-label={sendLabel}
            title={sendLabel}
            disabled={!eligible}
            aria-busy={busy || submitting || undefined}
            onClick={() => {
              void submit();
            }}
          >
            <ComposerIcon action="send" />
          </Button>
        ) : null}
      </>
    );
    function renderToolbar(menuContent?: React.ReactNode) {
      return compact ? (
        <div className="chat-composer-toolbar chat-composer-toolbar-compact">
          {onAttachmentsChange || addMenu || menuContent ? (
            <>
              <Button
                type="button"
                color="base"
                appearance="ghost"
                size="sm"
                shape="circle"
                aria-label={attachLabel}
                title={attachLabel}
                disabled={disabled}
                popoverTarget={addId}
                aria-controls={addId}
                aria-expanded={addOpen}
                style={{ anchorName: addAnchor } as React.CSSProperties}
              >
                <ComposerIcon action="attach" />
              </Button>
              <div
                id={addId}
                popover="auto"
                role="group"
                aria-label="Add files and more"
                className="popover popover-menu chat-composer-menu"
                style={{ positionAnchor: addAnchor } as React.CSSProperties}
                onToggle={(event) =>
                  setAddOpen(event.currentTarget.matches(":popover-open"))
                }
              >
                <div className="chat-composer-group">Add</div>
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
                        const files = Array.from(
                          event.currentTarget.files ?? [],
                        );
                        event.currentTarget.value = "";
                        if (files.length) addAttachments(files, "picker");
                      }}
                    />
                    <button
                      type="button"
                      className="popover-menu-item"
                      disabled={disabled}
                      onClick={(event) => {
                        event.currentTarget
                          .closest<HTMLElement>("[popover]")
                          ?.hidePopover?.();
                        openAttachments();
                      }}
                    >
                      <ComposerIcon action="attach" />
                      <span>Files</span>
                    </button>
                  </>
                ) : null}
                {menuContent}
                {addMenu}
              </div>
            </>
          ) : null}
          <div className="chat-composer-actions">{actionContent}</div>
        </div>
      ) : (
        <div className="chat-composer-actions">
          {attachmentAction}
          {actionContent}
        </div>
      );
    }
    return (
      <div
        {...props}
        ref={ref}
        className={cn("chat-composer", className)}
        style={
          compact
            ? ({
                ...props.style,
                anchorName:
                  props.style?.anchorName && props.style.anchorName !== "none"
                    ? `${props.style.anchorName}, ${completionAnchor}`
                    : completionAnchor,
              } as React.CSSProperties)
            : props.style
        }
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
            className={cn(
              "chat-composer-attachments",
              thumbnails && "chat-composer-thumbnails",
            )}
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
                    className={cn(
                      "chat-composer-attachment",
                      thumbnails && "chat-composer-attachment-tile",
                    )}
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
                          <img
                            className="chat-composer-preview"
                            src={previewUrl}
                            alt={name}
                          />
                        ) : file ? (
                          <AttachmentPreview file={file} />
                        ) : null}
                        {!thumbnails ? (
                          <div className="chat-composer-attachment-info">
                            <span
                              className="chat-composer-filename"
                              title={name}
                            >
                              {name}
                            </span>
                            {status ? (
                              <span className="chat-composer-description">
                                {status}
                              </span>
                            ) : null}
                            {progress !== undefined ? (
                              <progress
                                className="progress"
                                value={progress}
                                max={1}
                                aria-label={`Preparing ${name}`}
                              />
                            ) : null}
                          </div>
                        ) : null}
                        {retry ? (
                          <Button
                            type="button"
                            size="sm"
                            shape="circle"
                            disabled={disabled}
                            onClick={retry}
                            aria-label={`Retry ${name}`}
                            title={`Retry ${name}`}
                          >
                            <ComposerIcon action="retry" />
                          </Button>
                        ) : null}
                        {cancel ? (
                          <Button
                            type="button"
                            size="sm"
                            shape="circle"
                            disabled={disabled}
                            onClick={cancel}
                            aria-label={`Cancel ${name}`}
                            title={`Cancel ${name}`}
                          >
                            <ComposerIcon action="remove" />
                          </Button>
                        ) : null}
                        {onAttachmentsChange ? (
                          <Button
                            type="button"
                            size={thumbnails ? "xs" : "sm"}
                            shape="circle"
                            className={
                              thumbnails
                                ? "chat-composer-attachment-remove"
                                : undefined
                            }
                            color="base"
                            appearance="ghost"
                            disabled={disabled}
                            aria-label={`Remove ${name}`}
                            title={`Remove ${name}`}
                            onClick={() => removeAttachment(id)}
                          >
                            <ComposerIcon action="remove" />
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
        {showCompletion || completionHeader || completionStatus ? (
          <CompletionList
            composerId={composerId}
            label={completion?.label ?? "Suggestions"}
            candidates={showCompletion ? candidates : []}
            activeId={active?.id}
            onSelect={selectCompletion}
            compact={compact}
            anchorName={completionAnchor}
            header={completionHeader}
            status={completionStatus}
            onDismiss={dismissCompletion}
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
        {renderFooter ? renderFooter(renderToolbar) : renderToolbar()}
      </div>
    );
  },
);
ComposerShell.displayName = "ComposerShell";
