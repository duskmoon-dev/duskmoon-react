import { cn } from "../utils";

export const formClass = "form";
export const formItemClass = "form-item";
export const formItemLabelClass = "form-item-label";
export const formItemControlClass = "form-item-control";
export const formItemExtraClass = "form-item-extra";
export const formItemHelpClass = "form-item-help";
export const formItemRequiredClass = "form-item-required";
export const formItemErrorClass = "form-item-error";
export const formListClass = "form-list";
export const formErrorListClass = "form-error-list";

export function getFormClasses({
  layout = "horizontal",
  disabled,
  className,
}: {
  layout?: "horizontal" | "vertical" | "inline";
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    formClass,
    `form-${layout}`,
    disabled && "form-disabled",
    className,
  );
}

export function getFormItemClasses({
  required,
  error,
  className,
}: {
  required?: boolean;
  error?: boolean;
  className?: string;
}) {
  return cn(
    formItemClass,
    required && formItemRequiredClass,
    error && formItemErrorClass,
    className,
  );
}
