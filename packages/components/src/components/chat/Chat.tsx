import React, { forwardRef } from "react";
import {
  chatAvatarClass,
  chatFooterClass,
  chatHeaderClass,
  chatStatusClass,
  chatStatusItemClass,
  chatStatusValueClass,
  chatActionsClass,
  chatActionsHoverClass,
  chatScrollClass,
  chatScrollBodyClass,
  chatScrollTrackClass,
  chatScrollIndicatorClass,
  chatReasoningClass,
  chatToolCallClass,
  chatToolHeaderClass,
  chatToolResultClass,
  chatToolStatusClass,
  chatTypingClass,
  getChatBubbleClasses,
  getChatClasses,
  getChatToolClasses,
} from "../../classes/chat";
import { cn } from "../../utils";
import type {
  ChatAvatarProps,
  ChatBubbleProps,
  ChatComponent,
  ChatFooterProps,
  ChatStatusProps,
  ChatStatusItemProps,
  ChatStatusValueProps,
  ChatActionsProps,
  ChatScrollProps,
  ChatScrollBodyProps,
  ChatScrollTrackProps,
  ChatScrollIndicatorProps,
  ChatHeaderProps,
  ChatProps,
  ChatReasoningProps,
  ChatToolCallProps,
  ChatToolHeaderProps,
  ChatToolProps,
  ChatToolResultProps,
  ChatToolStatusProps,
  ChatTypingProps,
} from "./Chat.types";

export const ChatAvatar = forwardRef<HTMLDivElement, ChatAvatarProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatAvatarClass, className)} />
  ),
);

ChatAvatar.displayName = "Chat.Avatar";

export const ChatHeader = forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatHeaderClass, className)} />
  ),
);

ChatHeader.displayName = "Chat.Header";

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  (
    { color, size = "md", filled, streaming, className, children, ...props },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={getChatBubbleClasses({
        color,
        size,
        filled,
        streaming,
        className,
      })}
    >
      {children}
      {streaming ? (
        <span
          className="chat-bubble-content chat-bubble-streaming"
          aria-hidden="true"
        />
      ) : null}
    </div>
  ),
);

ChatBubble.displayName = "Chat.Bubble";

export const ChatFooter = forwardRef<HTMLDivElement, ChatFooterProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatFooterClass, className)} />
  ),
);

ChatFooter.displayName = "Chat.Footer";

export const ChatStatus = forwardRef<HTMLDivElement, ChatStatusProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatStatusClass, className)} />
  ),
);
ChatStatus.displayName = "Chat.Status";

export const ChatStatusItem = forwardRef<HTMLSpanElement, ChatStatusItemProps>(
  ({ className, ...props }, ref) => (
    <span {...props} ref={ref} className={cn(chatStatusItemClass, className)} />
  ),
);
ChatStatusItem.displayName = "Chat.StatusItem";

export const ChatStatusValue = forwardRef<HTMLSpanElement, ChatStatusValueProps>(
  ({ className, ...props }, ref) => (
    <span {...props} ref={ref} className={cn(chatStatusValueClass, className)} />
  ),
);
ChatStatusValue.displayName = "Chat.StatusValue";

export const ChatActions = forwardRef<HTMLDivElement, ChatActionsProps>(
  ({ hover, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={cn(chatActionsClass, hover && chatActionsHoverClass, className)}
    />
  ),
);
ChatActions.displayName = "Chat.Actions";

export const ChatScroll = forwardRef<HTMLDivElement, ChatScrollProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatScrollClass, className)} />
  ),
);
ChatScroll.displayName = "Chat.Scroll";

export const ChatScrollBody = forwardRef<HTMLDivElement, ChatScrollBodyProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatScrollBodyClass, className)} />
  ),
);
ChatScrollBody.displayName = "Chat.ScrollBody";

export const ChatScrollTrack = forwardRef<HTMLDivElement, ChatScrollTrackProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatScrollTrackClass, className)} />
  ),
);
ChatScrollTrack.displayName = "Chat.ScrollTrack";

export const ChatScrollIndicator = forwardRef<
  HTMLButtonElement,
  ChatScrollIndicatorProps
>(
  (
    { targetId, timeline, type = "button", className, onClick, ...props },
    ref,
  ) => (
    <button
      {...props}
      ref={ref}
      type={type}
      data-chat-target={targetId}
      data-chat-tl={timeline}
      aria-label={
        props["aria-label"] ??
        (props["aria-labelledby"]
          ? undefined
          : `Jump to assistant reply ${timeline}`)
      }
      className={cn(chatScrollIndicatorClass, className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const scroller = event.currentTarget.closest<HTMLElement>(
          `.${chatScrollClass}`,
        );
        const target = Array.from(
          scroller?.querySelectorAll<HTMLElement>("[id]") ?? [],
        ).find(
          (element) =>
            element.id === targetId &&
            element.closest(`.${chatScrollClass}`) === scroller,
        );
        if (!scroller || !target) return;
        const top =
          scroller.scrollTop +
          target.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top;
        const reducedMotion = scroller.ownerDocument.defaultView?.matchMedia?.(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        scroller.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      }}
    />
  ),
);
ChatScrollIndicator.displayName = "Chat.ScrollIndicator";

export const ChatReasoning = forwardRef<HTMLDetailsElement, ChatReasoningProps>(
  ({ className, ...props }, ref) => (
    <details
      {...props}
      ref={ref}
      className={cn(chatReasoningClass, className)}
    />
  ),
);

ChatReasoning.displayName = "Chat.Reasoning";

export const ChatTool = forwardRef<HTMLDetailsElement, ChatToolProps>(
  ({ status, className, ...props }, ref) => (
    <details
      {...props}
      ref={ref}
      className={getChatToolClasses({ status, className })}
    />
  ),
);

ChatTool.displayName = "Chat.Tool";

export const ChatToolHeader = forwardRef<HTMLElement, ChatToolHeaderProps>(
  ({ className, ...props }, ref) => (
    <summary
      {...props}
      ref={ref}
      className={cn(chatToolHeaderClass, className)}
    />
  ),
);

ChatToolHeader.displayName = "Chat.ToolHeader";

export const ChatToolStatus = forwardRef<HTMLSpanElement, ChatToolStatusProps>(
  ({ className, ...props }, ref) => (
    <span {...props} ref={ref} className={cn(chatToolStatusClass, className)} />
  ),
);

ChatToolStatus.displayName = "Chat.ToolStatus";

export const ChatToolCall = forwardRef<HTMLDivElement, ChatToolCallProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatToolCallClass, className)} />
  ),
);

ChatToolCall.displayName = "Chat.ToolCall";

export const ChatToolResult = forwardRef<HTMLDivElement, ChatToolResultProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(chatToolResultClass, className)} />
  ),
);

ChatToolResult.displayName = "Chat.ToolResult";

export const ChatTyping = forwardRef<HTMLSpanElement, ChatTypingProps>(
  (
    {
      className,
      role = "status",
      "aria-label": ariaLabel = "Assistant is typing",
      ...props
    },
    ref,
  ) => (
    <span
      {...props}
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      className={cn(chatTypingClass, className)}
    >
      <span aria-hidden="true" />
    </span>
  ),
);

ChatTyping.displayName = "Chat.Typing";

const ChatRoot = forwardRef<HTMLDivElement, ChatProps>(
  ({ placement = "start", timeline, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      data-chat-tl={timeline ?? props["data-chat-tl"]}
      className={getChatClasses({ placement, className })}
    />
  ),
);

ChatRoot.displayName = "Chat";

export const Chat = Object.assign(ChatRoot, {
  Avatar: ChatAvatar,
  Header: ChatHeader,
  Bubble: ChatBubble,
  Footer: ChatFooter,
  Status: ChatStatus,
  StatusItem: ChatStatusItem,
  StatusValue: ChatStatusValue,
  Actions: ChatActions,
  Scroll: ChatScroll,
  ScrollBody: ChatScrollBody,
  ScrollTrack: ChatScrollTrack,
  ScrollIndicator: ChatScrollIndicator,
  Reasoning: ChatReasoning,
  Tool: ChatTool,
  ToolHeader: ChatToolHeader,
  ToolStatus: ChatToolStatus,
  ToolCall: ChatToolCall,
  ToolResult: ChatToolResult,
  Typing: ChatTyping,
}) as ChatComponent;
