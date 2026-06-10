import { cn } from "../utils";

export const dmAuxiliaryBaseClass = "dm-auxiliary";
export const dmAuxiliaryContainerClass = "dm-auxiliary-container";
export const dmAuxiliaryIconClass = "dm-auxiliary-prompt-icon";
export const dmAuxiliaryContentClass = "dm-auxiliary-content";
export const dmAuxiliaryActionsClass = "dm-auxiliary-actions";
export const dmAuxiliaryActionClass = "dm-auxiliary-action";
export const dmAuxiliaryCloseClass = "dm-auxiliary-close";

export function getDmAuxiliaryClasses({
  closed,
  className,
}: {
  closed?: boolean;
  className?: string;
}) {
  return cn(dmAuxiliaryBaseClass, closed && "dm-auxiliary-closed", className);
}

