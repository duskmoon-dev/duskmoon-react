import { cn } from "../utils";

export const dmMessageContentClass = "dm-message-content";
export const dmMessageScrollbarClass = "dm-message-scrollbar";
export const dmMessageLineClass = "dm-message-line";

export function getDmMessageContentClasses({
  className,
}: {
  className?: string;
}) {
  return cn(dmMessageContentClass, className);
}
