import type { SplitterLayout } from "../components/splitter/Splitter.types";
import { cn } from "../utils";

export const dmSplitterBaseClass = "dm-splitter";
export const dmSplitterInnerClass = "dm-splitter-inner";
export const dmSplitterResetClass = "dm-splitter-reset";
export const dmSplitterPersistedClass = "dm-splitter-persisted";

export const dmSplitterLayoutClasses: Record<SplitterLayout, string> = {
  horizontal: "dm-splitter-horizontal",
  vertical: "dm-splitter-vertical",
};

export function getDmSplitterClasses({
  layout,
  persisted,
  className,
}: {
  layout: SplitterLayout;
  persisted?: boolean;
  className?: string;
}) {
  return cn(
    dmSplitterBaseClass,
    dmSplitterLayoutClasses[layout],
    persisted && dmSplitterPersistedClass,
    className,
  );
}

