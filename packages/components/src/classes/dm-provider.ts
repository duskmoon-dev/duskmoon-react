import { cn } from "../utils";

export const dmProviderClass = "dm-provider";

export function getDmProviderClasses({ className }: { className?: string }) {
  return cn(dmProviderClass, className);
}
