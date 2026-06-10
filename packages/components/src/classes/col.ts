import { cn } from "../utils";

export const colBaseClass = "col";

export function getColClasses({ className }: { className?: string }) {
  return cn(colBaseClass, className);
}
