import { cn } from "../utils";

export const markdownBaseClass = "markdown-body";
export const markdownFrontMatterClass = "dm-front-matter";
export const markdownColorCodeClass = "dm-color-code";
export const markdownColorChipClass = "dm-color-chip";
export const markdownColorChipSwatchClass = "dm-color-chip-swatch";

export function getMarkdownClasses({
  variant,
  className,
}: {
  variant?: string;
  className?: string;
}) {
  return cn(
    markdownBaseClass,
    variant && `${markdownBaseClass}-${variant}`,
    className,
  );
}
