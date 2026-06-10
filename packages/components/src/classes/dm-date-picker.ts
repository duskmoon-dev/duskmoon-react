import { cn } from "../utils";

export const dmDatePickerClass = "dm-date-picker";

export function getDmDatePickerClasses({ className }: { className?: string }) {
  return cn(dmDatePickerClass, className);
}
