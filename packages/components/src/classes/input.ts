import { cn } from "../utils";
import type {
  InputSize,
  InputStatus,
  InputVariant,
  TextAreaResize,
} from "../components/input/Input.types";

export const inputBaseClass = "input";
export const inputWrapperClass = "input-wrapper";
export const inputAffixWrapperClass = "input-affix-wrapper";
export const inputPrefixClass = "input-prefix";
export const inputSuffixClass = "input-suffix";
export const inputClearClass = "input-clear";
export const inputSearchClass = "input-search";
export const inputSearchButtonClass = "input-search-button";
export const inputPasswordClass = "input-password";
export const inputPasswordToggleClass = "input-password-toggle";
export const inputGroupClass = "input-group";

export const textAreaBaseClass = "textarea";
export const textAreaWrapperClass = "textarea-wrapper";
export const textAreaCountClass = "textarea-counter";
export const textAreaCountExceededClass = "textarea-counter-exceeded";
export const textAreaAutoSizeClass = "textarea-auto-resize";

export const inputVariantClasses: Record<InputVariant, string> = {
  filled: "input-filled",
  outlined: "input-outlined",
};

export const inputSizeClasses: Record<InputSize, string> = {
  sm: "input-sm",
  md: "input-md",
  lg: "input-lg",
};

export const inputStatusClasses: Record<InputStatus, string> = {
  error: "input-error",
  success: "input-success",
};

export const textAreaVariantClasses: Record<InputVariant, string> = {
  filled: "textarea-filled",
  outlined: "textarea-outlined",
};

export const textAreaSizeClasses: Record<InputSize, string> = {
  sm: "textarea-sm",
  md: "",
  lg: "textarea-lg",
};

export const textAreaStatusClasses: Record<InputStatus, string> = {
  error: "textarea-error",
  success: "textarea-success",
};

export const textAreaResizeClasses: Record<TextAreaResize, string> = {
  none: "textarea-resize-none",
  both: "textarea-resize-both",
  horizontal: "textarea-resize-horizontal",
  vertical: "textarea-resize-vertical",
};

export function getInputClasses({
  size = "md",
  status,
  variant = "outlined",
  className,
}: {
  size?: InputSize;
  status?: InputStatus;
  variant?: InputVariant;
  className?: string;
}) {
  return cn(
    inputBaseClass,
    inputVariantClasses[variant],
    inputSizeClasses[size],
    status && inputStatusClasses[status],
    className,
  );
}

export function getInputWrapperClasses({
  affixed,
  className,
}: {
  affixed?: boolean;
  className?: string;
}) {
  return cn(inputWrapperClass, affixed && inputAffixWrapperClass, className);
}

export function getSearchWrapperClasses({ className }: { className?: string }) {
  return cn(inputSearchClass, className);
}

export function getPasswordWrapperClasses({
  className,
}: {
  className?: string;
}) {
  return cn(inputPasswordClass, className);
}

export function getTextAreaClasses({
  size = "md",
  status,
  variant = "outlined",
  resize = "vertical",
  autoSize,
  className,
}: {
  size?: InputSize;
  status?: InputStatus;
  variant?: InputVariant;
  resize?: TextAreaResize;
  autoSize?: boolean;
  className?: string;
}) {
  return cn(
    textAreaBaseClass,
    textAreaVariantClasses[variant],
    textAreaSizeClasses[size],
    status && textAreaStatusClasses[status],
    textAreaResizeClasses[resize],
    autoSize && textAreaAutoSizeClass,
    className,
  );
}

export function getTextAreaCountClasses({ exceeded }: { exceeded?: boolean }) {
  return cn(textAreaCountClass, exceeded && textAreaCountExceededClass);
}
