import type { ReactNode } from "react";
import type { DmPaginationProps } from "../dm-pagination";
import type { DmSearchItem, DmSearchProps } from "../dm-search";
import type {
  TableColumnType,
  TableProps,
  TableRecord,
} from "../table/Table.types";

export interface DmTableColumnType<T = TableRecord> extends TableColumnType<T> {
  hideInTable?: boolean;
  onlySearch?: boolean;
  search?: false | DmSearchItem["search"];
  children?: DmTableColumnsType<T>;
}

export type DmTableColumnsType<T = TableRecord> = DmTableColumnType<T>[];

export interface DmTableProps<T = TableRecord> extends Omit<
  TableProps<T>,
  "columns" | "pagination"
> {
  name?: ReactNode;
  extra?: ReactNode;
  indicators?: ReactNode;
  onColumnsChange?: (columns: DmTableColumnsType<T>) => void;
  columnSettingVisible?: boolean;
  columnState?: {
    persistenceKey: string;
    persistenceType?: "localStorage";
  };
  columns: DmTableColumnsType<T>;
  searchProps?: Omit<DmSearchProps, "items"> & { items?: DmSearchItem[] };
  tableExtra?: ReactNode;
  pagination?: false | DmPaginationProps;
}
