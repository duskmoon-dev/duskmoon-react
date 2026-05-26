import { cn } from "../utils";

export const flexBaseClass = "flex";
export const flexVerticalClass = "flex-vertical";
export const flexWrapClass = "flex-wrap";

export function getFlexClasses({
  vertical,
  wrap,
  className,
}: {
  vertical?: boolean;
  wrap?: boolean | React.CSSProperties["flexWrap"];
  className?: string;
}) {
  return cn(
    flexBaseClass,
    vertical && flexVerticalClass,
    wrap && flexWrapClass,
    className,
  );
}
