import { cn } from "../utils";

export const dmProTableBaseClass = "dm-pro-table";
export const dmProTableHeaderClass = "dm-pro-table-header";
export const dmProTableTitleClass = "dm-pro-table-title";
export const dmProTableToolbarClass = "dm-pro-table-toolbar";
export const dmProTableColumnSettingClass = "dm-pro-table-column-setting";

export function getDmProTableClasses({ className }: { className?: string }) {
  return cn(dmProTableBaseClass, className);
}
