import { cn } from "../utils";

export const modalBackdropClass = "modal-backdrop";
export const modalOpenClass = "modal-open";
export const modalBackdropCenterClass = "modal-backdrop-center";
export const modalClass = "modal";
export const modalHeaderClass = "modal-header";
export const modalTitleClass = "modal-title";
export const modalCloseClass = "modal-close";
export const modalBodyClass = "modal-body";
export const modalFooterClass = "modal-footer";

export function getModalBackdropClasses({
  open,
  centered,
  className,
}: {
  open?: boolean;
  centered?: boolean;
  className?: string;
}) {
  return cn(
    modalBackdropClass,
    open && modalOpenClass,
    centered && modalBackdropCenterClass,
    className,
  );
}

export function getModalClasses({ className }: { className?: string }) {
  return cn(modalClass, className);
}
