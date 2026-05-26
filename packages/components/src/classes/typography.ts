import { cn } from "../utils";
import type {
  TypographySize,
  TypographyStatus,
} from "../components/typography/Typography.types";

export const typographyBaseClass = "typography markdown-body";
export const typographyTextClass = "typography-text";
export const typographyTitleClass = "typography-title";
export const typographyParagraphClass = "typography-paragraph";
export const typographyLinkClass = "typography-link";
export const typographyDisabledClass = "typography-disabled";
export const typographyEditableClass = "typography-editable";
export const typographyEditingClass = "typography-editing";
export const typographyCopyableClass = "typography-copyable";
export const typographyEllipsisClass = "typography-ellipsis";
export const typographyExpandClass = "typography-expand";
export const typographyActionClass = "typography-action btn btn-text btn-sm";
export const typographyEditInputClass = "typography-edit-input input";

export const typographyStatusClasses: Record<TypographyStatus, string> = {
  secondary: "typography-secondary text-on-surface-variant",
  success: "typography-success text-success",
  warning: "typography-warning text-warning",
  danger: "typography-danger text-error",
};

export const typographySizeClasses: Record<TypographySize, string> = {
  sm: "typography-sm",
  md: "typography-md",
  lg: "typography-lg",
};

export function getTypographyClasses(className?: string) {
  return cn(typographyBaseClass, className);
}

export function getTypographyTextClasses({
  status,
  disabled,
  editable,
  copyable,
  ellipsis,
  size = "md",
  className,
}: {
  status?: TypographyStatus;
  disabled?: boolean;
  editable?: boolean;
  copyable?: boolean;
  ellipsis?: boolean;
  size?: TypographySize;
  className?: string;
}) {
  return cn(
    typographyTextClass,
    typographySizeClasses[size],
    status && typographyStatusClasses[status],
    disabled && typographyDisabledClass,
    editable && typographyEditableClass,
    copyable && typographyCopyableClass,
    ellipsis && typographyEllipsisClass,
    className,
  );
}

export function getTypographyTitleClasses({
  status,
  disabled,
  editable,
  copyable,
  ellipsis,
  className,
}: {
  status?: TypographyStatus;
  disabled?: boolean;
  editable?: boolean;
  copyable?: boolean;
  ellipsis?: boolean;
  className?: string;
}) {
  return cn(
    typographyTitleClass,
    status && typographyStatusClasses[status],
    disabled && typographyDisabledClass,
    editable && typographyEditableClass,
    copyable && typographyCopyableClass,
    ellipsis && typographyEllipsisClass,
    className,
  );
}

export function getTypographyParagraphClasses({
  status,
  disabled,
  editable,
  copyable,
  ellipsis,
  className,
}: {
  status?: TypographyStatus;
  disabled?: boolean;
  editable?: boolean;
  copyable?: boolean;
  ellipsis?: boolean;
  className?: string;
}) {
  return cn(
    typographyParagraphClass,
    status && typographyStatusClasses[status],
    disabled && typographyDisabledClass,
    editable && typographyEditableClass,
    copyable && typographyCopyableClass,
    ellipsis && typographyEllipsisClass,
    className,
  );
}

export function getTypographyLinkClasses({
  status,
  disabled,
  ellipsis,
  className,
}: {
  status?: TypographyStatus;
  disabled?: boolean;
  ellipsis?: boolean;
  className?: string;
}) {
  return cn(
    typographyLinkClass,
    status && typographyStatusClasses[status],
    disabled && typographyDisabledClass,
    ellipsis && typographyEllipsisClass,
    className,
  );
}
