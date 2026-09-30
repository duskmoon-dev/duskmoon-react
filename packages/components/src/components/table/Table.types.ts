import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type TableKey = string | number;
export type TableRecord = Record<string, unknown>;
export type DataIndex = string | number | readonly (string | number)[];
export type SortOrder = "ascend" | "descend" | null;
export type FilterValue = Array<string | number | boolean | null>;
export type TableSize = "small" | "middle" | "large";
export type TableRowKey<T> = keyof T | ((record: T, index: number) => TableKey);

export interface TablePaginationConfig {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableFilterItem {
  text: ReactNode;
  value: string | number | boolean;
  children?: TableFilterItem[];
}

export type TableSorter<T> =
  | boolean
  | ((first: T, second: T) => number)
  | {
      compare?: (first: T, second: T) => number;
      multiple?: number;
    };

export interface TableColumnType<T = TableRecord> {
  title?: ReactNode;
  dataIndex?: DataIndex;
  key?: TableKey;
  width?: string | number;
  align?: "left" | "center" | "right";
  className?: string;
  fixed?: "left" | "right" | boolean;
  ellipsis?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sorter?: TableSorter<T>;
  sortOrder?: SortOrder;
  defaultSortOrder?: SortOrder;
  sortDirections?: SortOrder[];
  filters?: TableFilterItem[];
  filteredValue?: FilterValue | null;
  defaultFilteredValue?: FilterValue | null;
  filterMultiple?: boolean;
  onFilter?: (value: string | number | boolean | null, record: T) => boolean;
  children?: TableColumnsType<T>;
  onCell?: (record: T, index: number) => ComponentProps<"td">;
  onHeaderCell?: (column: TableColumnType<T>) => ComponentProps<"th">;
}

export interface TableColumnGroupType<T = TableRecord> extends Omit<
  TableColumnType<T>,
  "dataIndex" | "render" | "sorter" | "filters"
> {
  children: TableColumnsType<T>;
}

export type TableColumnsType<T = TableRecord> = TableColumnType<T>[];
export type TableColumnProps<T = TableRecord> = TableColumnType<T> & {
  children?: ReactNode;
};
export type TableColumnGroupProps<T = TableRecord> = Omit<
  TableColumnGroupType<T>,
  "children"
> & {
  children?: ReactNode;
};

export interface SorterResult<T = TableRecord> {
  column?: TableColumnType<T>;
  columnKey?: TableKey;
  field?: DataIndex;
  order?: SortOrder;
}

export interface TableCurrentDataSource<T = TableRecord> {
  currentDataSource: T[];
  action: "paginate" | "sort" | "filter";
}

export interface TableRowSelection<T = TableRecord> {
  type?: "checkbox" | "radio";
  selectedRowKeys?: TableKey[];
  defaultSelectedRowKeys?: TableKey[];
  hideSelectAll?: boolean;
  columnTitle?: ReactNode;
  getCheckboxProps?: (record: T) => ComponentProps<"input">;
  renderCell?: (
    checked: boolean,
    record: T,
    index: number,
    originNode: ReactNode,
  ) => ReactNode;
  onChange?: (selectedRowKeys: TableKey[], selectedRows: T[]) => void;
  onSelect?: (
    record: T,
    selected: boolean,
    selectedRows: T[],
    nativeEvent: Event,
  ) => void;
  onSelectAll?: (
    selected: boolean,
    selectedRows: T[],
    changedRows: T[],
  ) => void;
}

export interface TableExpandableConfig<T = TableRecord> {
  expandedRowKeys?: TableKey[];
  defaultExpandedRowKeys?: TableKey[];
  expandedRowRender?: (
    record: T,
    index: number,
    indent: number,
    expanded: boolean,
  ) => ReactNode;
  rowExpandable?: (record: T) => boolean;
  expandRowByClick?: boolean;
  columnTitle?: ReactNode;
  onExpand?: (expanded: boolean, record: T) => void;
  onExpandedRowsChange?: (expandedKeys: TableKey[]) => void;
}

export interface TableLocale {
  emptyText?: ReactNode;
}

export interface TableProps<T = TableRecord> extends Omit<
  ComponentProps<"div">,
  "onChange"
> {
  columns?: TableColumnsType<T>;
  dataSource?: T[];
  rowKey?: TableRowKey<T>;
  loading?: boolean | { spinning?: boolean; indicator?: ReactNode };
  bordered?: boolean;
  size?: TableSize;
  pagination?: false | TablePaginationConfig;
  rowSelection?: TableRowSelection<T>;
  expandable?: TableExpandableConfig<T>;
  summary?: (pageData: readonly T[]) => ReactNode;
  locale?: TableLocale;
  tableLayout?: CSSProperties["tableLayout"];
  scroll?: { x?: number | string | true; y?: number | string };
  onChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T>,
    extra: TableCurrentDataSource<T>,
  ) => void;
}

export interface TableSummaryProps extends ComponentProps<"tfoot"> {
  fixed?: boolean | "top" | "bottom";
}

export type TableSummaryRowProps = ComponentProps<"tr">;
export type TableSummaryCellProps = ComponentProps<"td"> & {
  index?: number;
};

export type TableColumnComponent = ForwardRefExoticComponent<
  TableColumnProps & RefAttributes<HTMLTableCellElement>
>;

export type TableColumnGroupComponent = ForwardRefExoticComponent<
  TableColumnGroupProps & RefAttributes<HTMLTableCellElement>
>;

export type TableSummaryComponent = ForwardRefExoticComponent<
  TableSummaryProps & RefAttributes<HTMLTableSectionElement>
> & {
  Row: ForwardRefExoticComponent<
    TableSummaryRowProps & RefAttributes<HTMLTableRowElement>
  >;
  Cell: ForwardRefExoticComponent<
    TableSummaryCellProps & RefAttributes<HTMLTableCellElement>
  >;
};

export type TableComponent = (<T = TableRecord>(
  props: TableProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & {
  Column: TableColumnComponent;
  ColumnGroup: TableColumnGroupComponent;
  Summary: TableSummaryComponent;
  SELECTION_ALL: "SELECT_ALL";
  SELECTION_INVERT: "SELECT_INVERT";
  SELECTION_NONE: "SELECT_NONE";
  SELECTION_COLUMN: "SELECTION_COLUMN";
  EXPAND_COLUMN: "EXPAND_COLUMN";
  displayName?: string;
};
