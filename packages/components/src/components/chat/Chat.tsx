import React, { forwardRef } from "react";
import {
  chatAvatarClass,
  chatFooterClass,
  chatHeaderClass,
  chatReasoningClass,
  chatStreamingCaretClass,
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
      {/* TODO(upstream): duskmoon-dev/duskmoonui#50 */}
      {streaming ? (
        <span className={chatStreamingCaretClass} aria-hidden="true" />
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
  ({ placement = "start", className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
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
  Reasoning: ChatReasoning,
  Tool: ChatTool,
  ToolHeader: ChatToolHeader,
  ToolStatus: ChatToolStatus,
  ToolCall: ChatToolCall,
  ToolResult: ChatToolResult,
  Typing: ChatTyping,
}) as ChatComponent;
