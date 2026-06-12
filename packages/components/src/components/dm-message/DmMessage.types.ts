import type { ReactNode } from "react";
import type {
  MessageArgsProps,
  MessageHandle,
  MessageType,
} from "../message/Message.types";

export type DmMessageType = MessageType;

export interface DmMessageContentProps {
  content: string;
  className?: string;
}

export interface DmMessageApi {
  error: (content: string, key?: string) => MessageHandle;
  success: (content: string, key?: string) => MessageHandle;
  warning: (content: string, key?: string) => MessageHandle;
  info: (content: string, key?: string) => MessageHandle;
  loading: (content: string, key?: string) => MessageHandle;
  open: (content: string, key?: string, type?: DmMessageType) => MessageHandle;
  destroy: (key?: string) => void;
}

export interface DmMessageHolderProps {
  className?: string;
}

export interface DmMessageOpenConfig extends Omit<
  MessageArgsProps,
  "content" | "type"
> {
  content: string;
  type?: DmMessageType;
}

export type DmMessageContentNode = ReactNode;
