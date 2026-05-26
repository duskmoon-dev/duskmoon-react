import type {
  MessagePlacement,
  MessageType,
} from "../components/message/Message.types";
import { cn } from "../utils";

export const messageHolderClass = "message-holder";
export const messageBaseClass = "message";
export const messageContentClass = "message-content";
export const messageIconClass = "message-icon";
export const messageCloseClass = "message-close";

export const messageTypeClasses: Record<MessageType, string> = {
  info: "message-info alert alert-info",
  success: "message-success alert alert-success",
  error: "message-error alert alert-error",
  warning: "message-warning alert alert-warning",
  loading: "message-loading alert",
};

export const messagePlacementClasses: Record<MessagePlacement, string> = {
  top: "message-top",
  bottom: "message-bottom",
};

export function getMessageHolderClasses({
  placement = "top",
  className,
}: {
  placement?: MessagePlacement;
  className?: string;
}) {
  return cn(messageHolderClass, messagePlacementClasses[placement], className);
}

export function getMessageClasses({
  type = "info",
  className,
}: {
  type?: MessageType;
  className?: string;
}) {
  return cn(messageBaseClass, messageTypeClasses[type], className);
}
