import { cn } from "../utils";

export const tableWrapperClass = "table-wrapper";
export const tableBaseClass = "table";
export const tableBorderedClass = "table-bordered";
export const tableLoadingClass = "table-loading";
export const tableSmallClass = "table-sm";
export const tableLargeClass = "table-lg";
export const tableHeaderCellClass = "table-header-cell";
export const tableCellClass = "table-cell";
export const tableRowClass = "table-row";
export const tableRowSelectedClass = "table-row-selected";
export const tableRowExpandedClass = "table-row-expanded";
export const tableEmptyClass = "table-empty";
export const tableLoadingIndicatorClass = "table-loading-indicator";
export const tableSorterClass = "table-sorter";
export const tableSorterActiveClass = "table-sorter-active";
export const tableFilterClass = "table-filter";
export const tableSelectionCellClass = "table-selection-cell";
export const tableExpandCellClass = "table-expand-cell";
export const tableExpandButtonClass = "table-expand-button";
export const tablePaginationClass = "table-pagination";
export const tablePaginationButtonClass = "table-pagination-button";
export const tablePaginationInfoClass = "table-pagination-info";

export function getTableWrapperClasses({
  loading,
  className,
}: {
  loading?: boolean;
  className?: string;
}) {
  return cn(tableWrapperClass, loading && tableLoadingClass, className);
}

export function getTableClasses({
  bordered,
  size,
}: {
  bordered?: boolean;
  size?: "small" | "middle" | "large";
}) {
  return cn(
    tableBaseClass,
    bordered && tableBorderedClass,
    size === "small" && tableSmallClass,
    size === "large" && tableLargeClass,
  );
}

export function getTableRowClasses({
  selected,
  expanded,
  className,
}: {
  selected?: boolean;
  expanded?: boolean;
  className?: string;
}) {
  return cn(
    tableRowClass,
    selected && tableRowSelectedClass,
    expanded && tableRowExpandedClass,
    className,
  );
}

export function getTableSorterClasses(active?: boolean) {
  return cn(tableSorterClass, active && tableSorterActiveClass);
}
