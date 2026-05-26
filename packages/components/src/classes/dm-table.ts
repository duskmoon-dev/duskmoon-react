import { cn } from "../utils";

export const dmTableBaseClass = "dm-table";
export const dmTableSearchClass = "dm-table-search";
export const dmTableCardClass = "dm-table-card";
export const dmTableHeaderClass = "dm-table-header";
export const dmTableTitleClass = "dm-table-title";
export const dmTableExtraClass = "dm-table-extra";
export const dmTableIndicatorsClass = "dm-table-indicators";
export const dmTableTableExtraClass = "dm-table-table-extra";
export const dmTableColumnSettingClass = "dm-table-column-setting";
export const dmTablePaginationClass = "dm-table-pagination";

export function getDmTableClasses({ className }: { className?: string }) {
  return cn(dmTableBaseClass, className);
}
