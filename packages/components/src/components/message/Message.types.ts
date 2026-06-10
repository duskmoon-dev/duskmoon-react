import type { ReactNode } from "react";

export type MessageType = "success" | "error" | "info" | "warning" | "loading";
export type MessagePlacement = "top" | "bottom";

export interface MessageConfig {
  top?: number;
  duration?: number;
  maxCount?: number;
  prefixCls?: string;
  getContainer?: () => HTMLElement;
  placement?: MessagePlacement;
}

export interface MessageArgsProps {
  key?: string | number;
  type?: MessageType;
  content?: ReactNode;
  duration?: number;
  className?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

export type MessageContent = ReactNode | MessageArgsProps;

export interface MessageInstance {
  key: string;
  type: MessageType;
  content?: ReactNode;
  duration: number;
  className?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

export interface MessageHandle extends Promise<void> {
  key: string;
  close: () => void;
}

export interface MessageApi {
  open: (config: MessageArgsProps) => MessageHandle;
  success: (content: MessageContent, duration?: number, onClose?: () => void) => MessageHandle;
  error: (content: MessageContent, duration?: number, onClose?: () => void) => MessageHandle;
  info: (content: MessageContent, duration?: number, onClose?: () => void) => MessageHandle;
  warning: (content: MessageContent, duration?: number, onClose?: () => void) => MessageHandle;
  loading: (content: MessageContent, duration?: number, onClose?: () => void) => MessageHandle;
  destroy: (key?: string | number) => void;
  config: (config: MessageConfig) => void;
  useMessage: () => [MessageApi, ReactNode];
}
