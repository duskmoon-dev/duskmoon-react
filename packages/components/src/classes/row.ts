import { cn } from "../utils";
import type { RowAlign, RowJustify } from "../components/row/Row.types";

export const rowBaseClass = "row";
export const rowNoWrapClass = "row-nowrap";

export const rowAlignClasses: Record<RowAlign, string> = {
  top: "row-align-top",
  middle: "row-align-middle",
  bottom: "row-align-bottom",
  stretch: "row-align-stretch",
};

export const rowJustifyClasses: Record<RowJustify, string> = {
  start: "row-justify-start",
  end: "row-justify-end",
  center: "row-justify-center",
  "space-around": "row-justify-space-around",
  "space-between": "row-justify-space-between",
  "space-evenly": "row-justify-space-evenly",
};

export function getRowClasses({
  align,
  justify,
  wrap = true,
  className,
}: {
  align?: RowAlign;
  justify?: RowJustify;
  wrap?: boolean;
  className?: string;
}) {
  return cn(
    rowBaseClass,
    align && rowAlignClasses[align],
    justify && rowJustifyClasses[justify],
    !wrap && rowNoWrapClass,
    className,
  );
}
