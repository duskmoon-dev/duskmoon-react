import { cn } from "../utils";
import type {
  NotificationPlacement,
  NotificationType,
} from "../components/notification/Notification.types";

export const notificationRootClass = "notification-root";
export const notificationHolderClass = "notification-holder";
export const notificationNoticeClass = "notification-notice";
export const notificationNoticeOpenClass = "notification-notice-open";
export const notificationIconClass = "notification-icon";
export const notificationContentClass = "notification-content";
export const notificationMessageClass = "notification-message";
export const notificationDescriptionClass = "notification-description";
export const notificationActionsClass = "notification-actions";
export const notificationCloseClass = "notification-close";

export const notificationPlacementClasses: Record<
  NotificationPlacement,
  string
> = {
  top: "notification-top",
  topLeft: "notification-top-left",
  topRight: "notification-top-right",
  bottom: "notification-bottom",
  bottomLeft: "notification-bottom-left",
  bottomRight: "notification-bottom-right",
};

export const notificationTypeClasses: Record<NotificationType, string> = {
  info: "toast-info alert-info",
  success: "toast-success alert-success",
  error: "toast-error alert-error",
  warning: "toast-warning alert-warning",
};

export function getNotificationHolderClasses({
  placement,
  className,
}: {
  placement: NotificationPlacement;
  className?: string;
}) {
  return cn(
    notificationHolderClass,
    notificationPlacementClasses[placement],
    className,
  );
}

export function getNotificationNoticeClasses({
  type = "info",
  open = true,
  className,
}: {
  type?: NotificationType;
  open?: boolean;
  className?: string;
}) {
  return cn(
    "toast",
    "alert",
    notificationNoticeClass,
    notificationTypeClasses[type],
    open && "toast-show",
    open && notificationNoticeOpenClass,
    className,
  );
}
