import type {
  ChatBubbleColor,
  ChatBubbleSize,
  ChatPlacement,
  ChatToolState,
} from "../components/chat/Chat.types";
import { cn } from "../utils";

export const chatBaseClass = "chat";
export const chatAvatarClass = "chat-avatar";
export const chatHeaderClass = "chat-header";
export const chatBubbleBaseClass = "chat-bubble";
export const chatFooterClass = "chat-footer";
export const chatReasoningClass = "chat-reasoning";
export const chatToolBaseClass = "chat-tool";
export const chatToolHeaderClass = "chat-tool-header";
export const chatToolStatusClass = "chat-tool-status";
export const chatToolCallClass = "chat-tool-call";
export const chatToolResultClass = "chat-tool-result";
export const chatTypingClass = "chat-typing";
export const chatStreamingCaretClass = "chat-streaming-caret";
export const chatBubbleFilledClass = "chat-bubble-filled";
export const chatBubbleStreamingClass = "chat-bubble-streaming";

export const chatPlacementClasses: Record<ChatPlacement, string> = {
  start: "chat-start",
  end: "chat-end",
};

export const chatBubbleColorClasses: Record<ChatBubbleColor, string> = {
  primary: "chat-bubble-primary",
  secondary: "chat-bubble-secondary",
  tertiary: "chat-bubble-tertiary",
  accent: "chat-bubble-accent",
  neutral: "chat-bubble-neutral",
  base: "chat-bubble-base",
  info: "chat-bubble-info",
  success: "chat-bubble-success",
  warning: "chat-bubble-warning",
  error: "chat-bubble-error",
};

export const chatBubbleSizeClasses: Record<ChatBubbleSize, string> = {
  xs: "chat-bubble-xs",
  sm: "chat-bubble-sm",
  md: "chat-bubble-md",
  lg: "chat-bubble-lg",
};

export const chatToolStateClasses: Record<ChatToolState, string> = {
  pending: "chat-tool-pending",
  running: "chat-tool-running",
  success: "chat-tool-success",
  error: "chat-tool-error",
};

export function getChatClasses({
  placement = "start",
  className,
}: {
  placement?: ChatPlacement;
  className?: string;
}) {
  return cn(chatBaseClass, chatPlacementClasses[placement], className);
}

export function getChatBubbleClasses({
  color,
  size = "md",
  filled,
  streaming,
  className,
}: {
  color?: ChatBubbleColor;
  size?: ChatBubbleSize;
  filled?: boolean;
  streaming?: boolean;
  className?: string;
}) {
  return cn(
    chatBubbleBaseClass,
    color && chatBubbleColorClasses[color],
    chatBubbleSizeClasses[size],
    filled && chatBubbleFilledClass,
    streaming && chatBubbleStreamingClass,
    className,
  );
}

export function getChatToolClasses({
  status,
  className,
}: {
  status?: ChatToolState;
  className?: string;
}) {
  return cn(
    chatToolBaseClass,
    status && chatToolStateClasses[status],
    className,
  );
}
