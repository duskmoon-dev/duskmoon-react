import { cn } from "../utils";

export const fabClass = "fab";
export const fabTriggerClass = "fab-trigger";
export const fabActionsClass = "fab-actions";
export const fabActionClass = "fab-action";
export const fabLabelClass = "fab-label";

export function getFabClasses({
  contained,
  start,
  speedDial,
  className,
}: {
  contained?: boolean;
  start?: boolean;
  speedDial?: boolean;
  className?: string;
}) {
  return cn(
    fabClass,
    contained && "fab-contained",
    start && "fab-start",
    speedDial && "fab-speed-dial",
    className,
  );
}
