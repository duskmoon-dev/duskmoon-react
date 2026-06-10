import { cn } from "../utils";

export const emptyBaseClass = "empty";
export const emptyImageClass = "empty-image";
export const emptyDescriptionClass = "empty-description";
export const emptyFooterClass = "empty-footer";

export function getEmptyClasses({ className }: { className?: string }) {
  return cn(emptyBaseClass, className);
}
