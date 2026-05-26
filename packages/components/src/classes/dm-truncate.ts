import { cn } from "../utils";

export const dmTruncateBaseClass = "dm-truncate";
export const dmTruncateContentClass = "dm-truncate-content";
export const dmTruncateTextClass = "dm-truncate-text";
export const dmTruncateMultilineClass = "dm-truncate-multiline";
export const dmTruncateOverflowClass = "dm-truncate-overflow";
export const dmTruncateOverflowTagClass = "dm-truncate-overflow-tag";
export const dmTruncateCopyClass = "dm-truncate-copy";
export const dmTruncateMeasureClass = "dm-truncate-measure";

export function getDmTruncateClasses(className?: string) {
  return cn(dmTruncateBaseClass, className);
}

export function getDmTruncateTextClasses({
  multiline,
  overflow,
  className,
}: {
  multiline?: boolean;
  overflow?: boolean;
  className?: string;
}) {
  return cn(
    dmTruncateTextClass,
    multiline && dmTruncateMultilineClass,
    overflow && dmTruncateOverflowClass,
    className,
  );
}

