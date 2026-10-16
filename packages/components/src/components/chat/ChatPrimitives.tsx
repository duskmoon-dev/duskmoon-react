import React, { forwardRef, useId } from "react";
import { cn } from "../../utils";
import { getChatClasses } from "../../classes/chat";
import type {
  ChatAgentProps,
  ChatContentProps,
  ChatWorkProps,
  ChatWorkSummaryProps,
  ChatWorkBodyProps,
  ChatInputAreaProps,
  ChatQueueProps,
  ChatComposerFormProps,
  ChatComposerInputProps,
  ChatComposerActionsProps,
  ChatComposerHintProps,
} from "./Chat.types";

export const ChatAgent = forwardRef<HTMLDivElement, ChatAgentProps>(
  ({ timeline, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-chat-tl={timeline ?? props["data-chat-tl"]}
      className={getChatClasses({ className: cn("chat-agent", className) })}
    />
  ),
);
ChatAgent.displayName = "Chat.Agent";

export const ChatContent = forwardRef<HTMLDivElement, ChatContentProps>(
  ({ streaming, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn("chat-content", streaming && "chat-streaming", className)}
    />
  ),
);
ChatContent.displayName = "Chat.Content";

export const ChatWork = forwardRef<HTMLDetailsElement, ChatWorkProps>(
  ({ className, ...props }, ref) => (
    <details {...props} ref={ref} className={cn("chat-work", className)} />
  ),
);
ChatWork.displayName = "Chat.Work";

export const ChatWorkSummary = forwardRef<HTMLElement, ChatWorkSummaryProps>(
  ({ className, ...props }, ref) => (
    <summary
      {...props}
      ref={ref}
      className={cn("chat-work-summary", className)}
    />
  ),
);
ChatWorkSummary.displayName = "Chat.WorkSummary";

export const ChatWorkBody = forwardRef<HTMLDivElement, ChatWorkBodyProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn("chat-work-body", className)} />
  ),
);
ChatWorkBody.displayName = "Chat.WorkBody";

export const ChatInputArea = forwardRef<HTMLDivElement, ChatInputAreaProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn("chat-input-area", className)} />
  ),
);
ChatInputArea.displayName = "Chat.InputArea";

export const ChatComposerForm = forwardRef<
  HTMLFormElement,
  ChatComposerFormProps
>(({ color, ghost, className, ...props }, ref) => (
  <form
    {...props}
    ref={ref}
    className={cn(
      "chat-composer",
      color && `chat-composer-${color}`,
      ghost && "chat-composer-ghost",
      className,
    )}
  />
));
ChatComposerForm.displayName = "Chat.ComposerForm";

export const ChatComposerInput = forwardRef<
  HTMLTextAreaElement,
  ChatComposerInputProps
>(({ className, ...props }, ref) => (
  <textarea
    {...props}
    ref={ref}
    className={cn("chat-composer-input", className)}
  />
));
ChatComposerInput.displayName = "Chat.ComposerInput";

export const ChatComposerActions = forwardRef<
  HTMLDivElement,
  ChatComposerActionsProps
>(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cn("chat-composer-actions", className)}
  />
));
ChatComposerActions.displayName = "Chat.ComposerActions";

export const ChatComposerHint = forwardRef<HTMLElement, ChatComposerHintProps>(
  ({ className, ...props }, ref) => (
    <kbd {...props} ref={ref} className={cn("chat-composer-hint", className)} />
  ),
);
ChatComposerHint.displayName = "Chat.ComposerHint";

/** Presentation only: actions request application state changes, never dequeue locally. */
export const ChatQueue = forwardRef<HTMLElement, ChatQueueProps>(
  (
    {
      items,
      activeId = items[0]?.id,
      pendingIds = [],
      steerDisabled,
      onSteer,
      onRemove,
      label = "Waiting messages",
      hidden,
      className,
      ...props
    },
    ref,
  ) => {
    const titleId = `${useId()}-queue-title`;
    return (
      <section
        {...props}
        ref={ref}
        hidden={hidden || items.length === 0}
        aria-labelledby={
          props["aria-labelledby"] ??
          (props["aria-label"] ? undefined : titleId)
        }
        className={cn("chat-queue", className)}
      >
        <div className="chat-queue-header sr-only">
          <h3 className="chat-queue-title" id={titleId}>
            {label}
          </h3>
          <span className="chat-queue-count">{items.length} queued</span>
        </div>
        {/* eslint-disable jsx-a11y/no-redundant-roles, jsx-a11y/no-noninteractive-tabindex -- Preserve list semantics with list-style:none and enable native keyboard scrolling. */}
        <ol
          className="chat-queue-list"
          role="list"
          tabIndex={0}
          aria-label={label}
        >
          {items.map((item, index) => {
            const pending = pendingIds.includes(item.id);
            return (
              <li
                key={item.id}
                className={cn(
                  "chat-queue-item",
                  item.id === activeId && "chat-queue-item-active",
                )}
                aria-busy={pending || undefined}
              >
                <svg
                  className="chat-queue-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m8 6 4 4-4 4M12 10H5m10-4h4m-4 6h4m-4 6h4" />
                </svg>
                <span className="chat-queue-number sr-only">#{index + 1}</span>
                {item.attachment ? (
                  <img
                    className="chat-queue-attachment"
                    src={item.attachment.src}
                    alt={item.attachment.alt}
                  />
                ) : null}
                <div className="chat-queue-content" title={item.text}>
                  {item.text}
                </div>
                <div className="chat-actions chat-queue-actions">
                  <button
                    className="btn btn-ghost btn-sm chat-queue-steer"
                    type="button"
                    disabled={pending || steerDisabled}
                    aria-label={`Steer waiting message ${index + 1}`}
                    onClick={() => onSteer(item.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="m15 4 5 5-5 5M20 9h-9a6 6 0 0 0-6 6v4" />
                    </svg>
                    Steer
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square chat-queue-remove"
                    type="button"
                    disabled={pending}
                    aria-label={`Remove waiting message ${index + 1}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        {/* eslint-enable jsx-a11y/no-redundant-roles, jsx-a11y/no-noninteractive-tabindex */}
      </section>
    );
  },
);
ChatQueue.displayName = "Chat.Queue";
