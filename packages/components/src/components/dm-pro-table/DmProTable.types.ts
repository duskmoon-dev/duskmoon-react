import type { ReactNode } from "react";
import type { DmTableProps } from "../dm-table";
import type { DmToolbarItem } from "../dm-toolbar";
import type { TableRecord } from "../table/Table.types";

export interface DmProTableProps<
  T = TableRecord,
> extends Omit<DmTableProps<T>, "dataSource"> {
  rowData?: T[];
  headerTitle?: ReactNode;
  toolBarRender?: (() => ReactNode[] | ReactNode) | ReactNode[] | ReactNode;
  toolbarItems?: DmToolbarItem[];
  showTitleBar?: boolean;
  columnSettingVisible?: boolean;
  onSortChanged?: (
    sortColumns: Array<{ columnKey?: string | number; order?: string | null }>,
  ) => void;
}
