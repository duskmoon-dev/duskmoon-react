import type { CSSProperties, ReactNode } from "react";

export type NotificationType = "success" | "info" | "warning" | "error";

export type NotificationPlacement =
  | "top"
  | "topLeft"
  | "topRight"
  | "bottom"
  | "bottomLeft"
  | "bottomRight";

export type NotificationKey = string | number;

export interface NotificationConfig {
  placement?: NotificationPlacement;
  duration?: number | null;
  maxCount?: number;
  top?: number;
  bottom?: number;
  closeIcon?: ReactNode;
  getContainer?: () => HTMLElement;
}

export interface NotificationArgsProps {
  key?: NotificationKey;
  message: ReactNode;
  description?: ReactNode;
  btn?: ReactNode;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  placement?: NotificationPlacement;
  duration?: number | null;
  type?: NotificationType;
  className?: string;
  style?: CSSProperties;
  role?: "alert" | "status";
  onClick?: () => void;
  onClose?: () => void;
}

export interface NotificationApi {
  open: (config: NotificationArgsProps) => void;
  success: (config: NotificationArgsProps) => void;
  info: (config: NotificationArgsProps) => void;
  warning: (config: NotificationArgsProps) => void;
  error: (config: NotificationArgsProps) => void;
  close: (key: NotificationKey) => void;
  destroy: (key?: NotificationKey) => void;
}

export type NotificationUseNotification = (
  config?: NotificationConfig,
) => [NotificationApi, ReactNode];

export interface NotificationStaticApi extends NotificationApi {
  config: (config: NotificationConfig) => void;
  useNotification: NotificationUseNotification;
}
