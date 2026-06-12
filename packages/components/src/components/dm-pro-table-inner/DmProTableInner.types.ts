import type { DmTableProps } from "../dm-table";
import type { TableRecord } from "../table/Table.types";

export interface DmProTableInnerProps<T = TableRecord> extends Omit<
  DmTableProps<T>,
  "dataSource"
> {
  rowData?: T[];
}
