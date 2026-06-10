import { cn } from "../utils";
import type { MentionsPlacement } from "../components/mentions/Mentions.types";

export const mentionsBaseClass = "mentions";
export const mentionsTextareaClass = "mentions-textarea";
export const mentionsDropdownClass = "mentions-dropdown";
export const mentionsOptionsClass = "mentions-options";
export const mentionsOptionClass = "mentions-option";
export const mentionsOptionSelectedClass = "mentions-option-selected";
export const mentionsOptionFocusedClass = "mentions-option-focused";
export const mentionsOptionDisabledClass = "mentions-option-disabled";
export const mentionsNoOptionsClass = "mentions-no-options";

export const mentionsPlacementClasses: Record<MentionsPlacement, string> = {
  bottom: "mentions-placement-bottom",
  top: "mentions-placement-top",
};

export function getMentionsClasses({
  disabled,
  open,
  placement = "bottom",
  className,
}: {
  disabled?: boolean;
  open?: boolean;
  placement?: MentionsPlacement;
  className?: string;
}) {
  return cn(
    mentionsBaseClass,
    disabled && "mentions-disabled",
    open && "mentions-open",
    mentionsPlacementClasses[placement],
    className,
  );
}

export function getMentionsDropdownClasses({
  placement = "bottom",
  className,
}: {
  placement?: MentionsPlacement;
  className?: string;
}) {
  return cn(mentionsDropdownClass, mentionsPlacementClasses[placement], className);
}

export function getMentionsOptionClasses({
  selected,
  focused,
  disabled,
  className,
}: {
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    mentionsOptionClass,
    selected && mentionsOptionSelectedClass,
    focused && mentionsOptionFocusedClass,
    disabled && mentionsOptionDisabledClass,
    className,
  );
}
