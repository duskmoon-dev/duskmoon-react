import React, {
  forwardRef,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  getTableClasses,
  getTableRowClasses,
  getTableSorterClasses,
  getTableWrapperClasses,
  tableCellClass,
  tableEmptyClass,
  tableExpandButtonClass,
  tableExpandCellClass,
  tableFilterClass,
  tableHeaderCellClass,
  tableLoadingIndicatorClass,
  tablePaginationButtonClass,
  tablePaginationClass,
  tablePaginationInfoClass,
  tableSelectionCellClass,
} from "../../classes/table";
import { cn } from "../../utils";
import type {
  DataIndex,
  FilterValue,
  SortOrder,
  SorterResult,
  TableColumnGroupProps,
  TableColumnProps,
  TableColumnType,
  TableColumnsType,
  TableComponent,
  TableKey,
  TablePaginationConfig,
  TableProps,
  TableRecord,
  TableSummaryCellProps,
  TableSummaryProps,
  TableSummaryRowProps,
} from "./Table.types";

interface NormalizedColumn<T> extends TableColumnType<T> {
  columnKey: TableKey;
  children?: NormalizedColumn<T>[];
}

interface HeaderCell<T> {
  column: NormalizedColumn<T>;
  colSpan: number;
  rowSpan: number;
}

const defaultPageSize = 10;
const defaultSortDirections: SortOrder[] = ["ascend", "descend", null];

function hasNode(node: ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function textFromNode(node: ReactNode, fallback: string) {
  return typeof node === "string" || typeof node === "number"
    ? String(node)
    : fallback;
}

function dataIndexKey(dataIndex?: DataIndex): TableKey | undefined {
  if (dataIndex === undefined) {
    return undefined;
  }

  return typeof dataIndex === "string" || typeof dataIndex === "number"
    ? dataIndex
    : Array.from(dataIndex).join(".");
}

function getValue(record: unknown, dataIndex?: DataIndex): unknown {
  if (dataIndex === undefined) {
    return undefined;
  }

  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];

  return path.reduce<unknown>((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return (current as Record<string | number, unknown>)[key];
  }, record);
}

function getRecordKey<T>(
  record: T,
  index: number,
  rowKey: TableProps<T>["rowKey"],
): TableKey {
  if (typeof rowKey === "function") {
    return rowKey(record, index);
  }

  if (rowKey) {
    const key = (record as Record<string | number, unknown>)[rowKey as string | number];
    return typeof key === "string" || typeof key === "number" ? key : index;
  }

  const key = (record as Record<string, unknown>).key;
  return typeof key === "string" || typeof key === "number" ? key : index;
}

function normalizeKeys(keys?: TableKey[]) {
  return keys?.map(String) ?? [];
}

function normalizeColumns<T>(
  columns: TableColumnsType<T>,
  prefix = "column",
): NormalizedColumn<T>[] {
  return columns.map((column, index) => {
    const rawKey = column.key ?? dataIndexKey(column.dataIndex) ?? `${prefix}-${index}`;
    return {
      ...column,
      columnKey: rawKey,
      children: column.children
        ? normalizeColumns(column.children, String(rawKey))
        : undefined,
    };
  });
}

function leafColumns<T>(columns: NormalizedColumn<T>[]): NormalizedColumn<T>[] {
  return columns.flatMap((column) =>
    column.children?.length ? leafColumns(column.children) : [column],
  );
}

function getDepth<T>(columns: NormalizedColumn<T>[]): number {
  if (columns.length === 0) {
    return 1;
  }

  return Math.max(
    ...columns.map((column) =>
      column.children?.length ? 1 + getDepth(column.children) : 1,
    ),
  );
}

function getLeafCount<T>(column: NormalizedColumn<T>): number {
  return column.children?.length
    ? column.children.reduce((count, child) => count + getLeafCount(child), 0)
    : 1;
}

function buildHeaderRows<T>(
  columns: NormalizedColumn<T>[],
  depth: number,
  level = 0,
  rows: HeaderCell<T>[][] = [],
) {
  rows[level] ??= [];

  columns.forEach((column) => {
    const grouped = Boolean(column.children?.length);
    rows[level].push({
      column,
      colSpan: grouped ? getLeafCount(column) : 1,
      rowSpan: grouped ? 1 : depth - level,
    });

    if (column.children?.length) {
      buildHeaderRows(column.children, depth, level + 1, rows);
    }
  });

  return rows;
}

function optionValues(filters?: TableColumnType["filters"]) {
  return (filters ?? []).flatMap((filter) => [
    filter,
    ...(filter.children ?? []),
  ]);
}

function sortCompare<T>(
  sorter: TableColumnType<T>["sorter"],
): ((first: T, second: T) => number) | undefined {
  if (typeof sorter === "function") {
    return sorter;
  }

  if (typeof sorter === "object" && sorter.compare) {
    return sorter.compare;
  }

  return undefined;
}

function sortOrderFor<T>(
  column: NormalizedColumn<T>,
  sortStates: Record<string, SortOrder | undefined>,
) {
  if (column.sortOrder !== undefined) {
    return column.sortOrder;
  }

  return sortStates[String(column.columnKey)] ?? column.defaultSortOrder;
}

function filterValueFor<T>(
  column: NormalizedColumn<T>,
  filterStates: Record<string, FilterValue | null | undefined>,
) {
  if (column.filteredValue !== undefined) {
    return column.filteredValue;
  }

  const state = filterStates[String(column.columnKey)];
  return state !== undefined ? state : column.defaultFilteredValue;
}

function nextSortOrder<T>(
  column: NormalizedColumn<T>,
  current: SortOrder | undefined,
) {
  const directions = column.sortDirections ?? defaultSortDirections;
  const index = directions.findIndex((order) => order === (current ?? null));
  return directions[(index + 1) % directions.length] ?? null;
}

function selectedRowsForKeys<T>(
  data: T[],
  keys: TableKey[],
  rowKey: TableProps<T>["rowKey"],
) {
  const keySet = new Set(normalizeKeys(keys));
  return data.filter((record, index) =>
    keySet.has(String(getRecordKey(record, index, rowKey))),
  );
}

const Column = forwardRef<HTMLTableCellElement, TableColumnProps>(() => null);
Column.displayName = "Table.Column";

const ColumnGroup = forwardRef<HTMLTableCellElement, TableColumnGroupProps>(
  () => null,
);
ColumnGroup.displayName = "Table.ColumnGroup";

const SummaryRow = forwardRef<HTMLTableRowElement, TableSummaryRowProps>(
  (props, ref) => <tr {...props} ref={ref} />,
);
SummaryRow.displayName = "Table.Summary.Row";

const SummaryCell = forwardRef<HTMLTableCellElement, TableSummaryCellProps>(
  ({ index, ...props }, ref) => {
    void index;
    return <td {...props} ref={ref} />;
  },
);
SummaryCell.displayName = "Table.Summary.Cell";

const Summary = Object.assign(
  forwardRef<HTMLTableSectionElement, TableSummaryProps>(
    ({ fixed, ...props }, ref) => {
      void fixed;
      return <tfoot {...props} ref={ref} />;
    },
  ),
  {
    Row: SummaryRow,
    Cell: SummaryCell,
  },
);
Summary.displayName = "Table.Summary";

function columnsFromChildren<T>(children: ReactNode): TableColumnsType<T> {
  return React.Children.toArray(children).flatMap((child): TableColumnsType<T> => {
    if (!React.isValidElement(child)) {
      return [];
    }

    if (child.type === Column) {
      const props = child.props as TableColumnProps<T>;
      const { children: columnChildren, ...column } = props;
      void columnChildren;
      return [column];
    }

    if (child.type === ColumnGroup) {
      const props = child.props as TableColumnGroupProps<T>;
      const { children: groupChildren, ...column } = props;
      return [
        {
          ...column,
          children: columnsFromChildren<T>(groupChildren),
        },
      ];
    }

    return [];
  });
}

function renderSummary<T>(
  summary: TableProps<T>["summary"],
  pageData: readonly T[],
  colSpan: number,
) {
  if (!summary) {
    return null;
  }

  const node = summary(pageData);

  if (React.isValidElement(node) && node.type === Summary) {
    return node;
  }

  return (
    <tfoot>
      <tr>
        <td className={tableCellClass} colSpan={colSpan}>
          {node}
        </td>
      </tr>
    </tfoot>
  );
}

function resolvePagination(
  pagination: TableProps["pagination"],
  total: number,
) {
  if (pagination === false) {
    return null;
  }

  const config = pagination ?? {};
  return {
    current: config.current,
    defaultCurrent: config.defaultCurrent ?? 1,
    pageSize: config.pageSize,
    defaultPageSize: config.defaultPageSize ?? defaultPageSize,
    total: config.total ?? total,
    disabled: config.disabled,
    hideOnSinglePage: config.hideOnSinglePage,
    showTotal: config.showTotal,
    onChange: config.onChange,
  } satisfies TablePaginationConfig;
}

function TableRoot<T extends TableRecord = TableRecord>(
  {
    columns,
    dataSource = [],
    rowKey,
    loading,
    bordered,
    size = "middle",
    pagination,
    rowSelection,
    expandable,
    summary,
    locale,
    tableLayout,
    scroll,
    onChange,
    children,
    className,
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const childColumns = useMemo(() => columnsFromChildren<T>(children), [children]);
  const normalizedColumns = useMemo(
    () => normalizeColumns(columns ?? childColumns),
    [childColumns, columns],
  );
  const leaves = useMemo(() => leafColumns(normalizedColumns), [normalizedColumns]);
  const headerRows = useMemo(
    () => buildHeaderRows(normalizedColumns, getDepth(normalizedColumns)),
    [normalizedColumns],
  );
  const [sortStates, setSortStates] = useState<Record<string, SortOrder | undefined>>({});
  const [filterStates, setFilterStates] = useState<Record<string, FilterValue | null>>({});
  const [internalCurrent, setInternalCurrent] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<TableKey[]>(
    rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<TableKey[]>(
    expandable?.defaultExpandedRowKeys ?? [],
  );

  const spinning = typeof loading === "object" ? loading.spinning : Boolean(loading);
  const activeFilters = useMemo(() => {
    return leaves.reduce<Record<string, FilterValue | null>>((result, column) => {
      const value = filterValueFor(column, filterStates) ?? null;

      if (value !== null) {
        result[String(column.columnKey)] = value;
      }

      return result;
    }, {});
  }, [filterStates, leaves]);
  const activeSorter = useMemo<SorterResult<T>>(() => {
    const column = leaves.find((item) => sortOrderFor(item, sortStates));

    if (!column) {
      return {};
    }

    return {
      column,
      columnKey: column.columnKey,
      field: column.dataIndex,
      order: sortOrderFor(column, sortStates) ?? null,
    };
  }, [leaves, sortStates]);
  const filteredData = useMemo(() => {
    return leaves.reduce<T[]>((records, column) => {
      const values = filterValueFor(column, filterStates);

      if (!values?.length || !column.onFilter) {
        return records;
      }

      return records.filter((record) =>
        values.some((value) => column.onFilter?.(value, record)),
      );
    }, dataSource);
  }, [dataSource, filterStates, leaves]);
  const sortedData = useMemo(() => {
    const sorterColumn = leaves.find((column) => sortOrderFor(column, sortStates));
    const order = sorterColumn ? sortOrderFor(sorterColumn, sortStates) : null;
    const compare = sorterColumn ? sortCompare(sorterColumn.sorter) : undefined;

    if (!sorterColumn || !order || !compare) {
      return filteredData;
    }

    return [...filteredData].sort((first, second) => {
      const result = compare(first, second);
      return order === "descend" ? -result : result;
    });
  }, [filteredData, leaves, sortStates]);
  const paginationConfig = resolvePagination(pagination, sortedData.length);
  const pageSize = Math.max(
    1,
    Math.floor(
      paginationConfig?.pageSize ??
        (internalPageSize === defaultPageSize
          ? paginationConfig?.defaultPageSize
          : internalPageSize) ??
        defaultPageSize,
    ),
  );
  const pageCount = paginationConfig
    ? Math.max(1, Math.ceil(Math.max(0, paginationConfig.total ?? sortedData.length) / pageSize))
    : 1;
  const current = paginationConfig
    ? Math.min(
        pageCount,
        Math.max(
          1,
          Math.floor(
            paginationConfig.current ?? internalCurrent ?? paginationConfig.defaultCurrent ?? 1,
          ),
        ),
      )
    : 1;
  const pageData = paginationConfig
    ? sortedData.slice((current - 1) * pageSize, current * pageSize)
    : sortedData;
  const selectedKeys = rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  const selectedKeySet = new Set(normalizeKeys(selectedKeys));
  const expandedKeys = expandable?.expandedRowKeys ?? internalExpandedKeys;
  const expandedKeySet = new Set(normalizeKeys(expandedKeys));
  const hasSelection = Boolean(rowSelection);
  const hasExpandable = Boolean(expandable?.expandedRowRender);
  const structuralColumnCount =
    leaves.length + (hasSelection ? 1 : 0) + (hasExpandable ? 1 : 0);
  const bodyEmpty = pageData.length === 0;

  function emitTableChange(
    nextPagination: TablePaginationConfig,
    nextFilters: Record<string, FilterValue | null>,
    nextSorter: SorterResult<T>,
    action: "paginate" | "sort" | "filter",
  ) {
    onChange?.(nextPagination, nextFilters, nextSorter, {
      currentDataSource: sortedData,
      action,
    });
  }

  function changePage(nextPage: number, nextPageSize = pageSize) {
    if (!paginationConfig || paginationConfig.disabled) {
      return;
    }

    const nextPageCount = Math.max(
      1,
      Math.ceil((paginationConfig.total ?? sortedData.length) / nextPageSize),
    );
    const normalizedPage = Math.min(nextPageCount, Math.max(1, nextPage));

    if (paginationConfig.current === undefined) {
      setInternalCurrent(normalizedPage);
    }

    if (paginationConfig.pageSize === undefined) {
      setInternalPageSize(nextPageSize);
    }

    paginationConfig.onChange?.(normalizedPage, nextPageSize);
    emitTableChange(
      { ...paginationConfig, current: normalizedPage, pageSize: nextPageSize },
      activeFilters,
      activeSorter,
      "paginate",
    );
  }

  function changeSorter(column: NormalizedColumn<T>) {
    if (!column.sorter) {
      return;
    }

    const nextOrder = nextSortOrder(column, sortOrderFor(column, sortStates));
    const nextSortStates = { [String(column.columnKey)]: nextOrder };
    const nextSorter: SorterResult<T> = nextOrder
      ? {
          column,
          columnKey: column.columnKey,
          field: column.dataIndex,
          order: nextOrder,
        }
      : {};

    setSortStates(nextSortStates);
    setInternalCurrent(1);
    emitTableChange(
      { ...(paginationConfig ?? {}), current: 1, pageSize },
      activeFilters,
      nextSorter,
      "sort",
    );
  }

  function changeFilter(
    column: NormalizedColumn<T>,
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    const selected = Array.from(event.currentTarget.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value !== "");
    const nextValue = selected.length > 0 ? selected : null;
    const nextFilters = {
      ...activeFilters,
      [String(column.columnKey)]: nextValue,
    };

    if (nextValue === null) {
      delete nextFilters[String(column.columnKey)];
    }

    setFilterStates((currentFilters) => ({
      ...currentFilters,
      [String(column.columnKey)]: nextValue,
    }));
    setInternalCurrent(1);
    emitTableChange(
      { ...(paginationConfig ?? {}), current: 1, pageSize },
      nextFilters,
      activeSorter,
      "filter",
    );
  }

  function commitSelection(
    nextKeys: TableKey[],
    nativeEvent: Event,
    changedRecord?: T,
    selected?: boolean,
    changedRows?: T[],
  ) {
    if (!rowSelection) {
      return;
    }

    const normalizedNextKeys = Array.from(new Set(nextKeys.map(String)));
    const originalKeys = normalizedNextKeys.map((key) => {
      const index = dataSource.findIndex(
        (record, itemIndex) => String(getRecordKey(record, itemIndex, rowKey)) === key,
      );
      return index >= 0 ? getRecordKey(dataSource[index], index, rowKey) : key;
    });
    const selectedRows = selectedRowsForKeys(dataSource, originalKeys, rowKey);

    if (rowSelection.selectedRowKeys === undefined) {
      setInternalSelectedKeys(originalKeys);
    }

    rowSelection.onChange?.(originalKeys, selectedRows);

    if (changedRecord && selected !== undefined) {
      rowSelection.onSelect?.(changedRecord, selected, selectedRows, nativeEvent);
    }

    if (changedRows) {
      rowSelection.onSelectAll?.(Boolean(selected), selectedRows, changedRows);
    }
  }

  function toggleRowSelection(record: T, index: number, event: ChangeEvent<HTMLInputElement>) {
    if (!rowSelection) {
      return;
    }

    const key = getRecordKey(record, index, rowKey);
    const keyString = String(key);
    const checked = event.currentTarget.checked;
    const nextKeys =
      rowSelection.type === "radio"
        ? checked
          ? [key]
          : []
        : checked
          ? [...selectedKeys, key]
          : selectedKeys.filter((selectedKey) => String(selectedKey) !== keyString);

    commitSelection(nextKeys, event.nativeEvent, record, checked);
  }

  function toggleAllRows(event: ChangeEvent<HTMLInputElement>) {
    if (!rowSelection) {
      return;
    }

    const checked = event.currentTarget.checked;
    const selectableRows = pageData.filter((record, index) => {
      const checkboxProps = rowSelection.getCheckboxProps?.(record);
      return !checkboxProps?.disabled && getRecordKey(record, index, rowKey) !== undefined;
    });
    const pageKeys = selectableRows.map((record, index) =>
      getRecordKey(record, index, rowKey),
    );
    const pageKeySet = new Set(normalizeKeys(pageKeys));
    const nextKeys = checked
      ? [...selectedKeys, ...pageKeys]
      : selectedKeys.filter((key) => !pageKeySet.has(String(key)));

    commitSelection(nextKeys, event.nativeEvent, undefined, checked, selectableRows);
  }

  function toggleExpand(record: T, index: number) {
    if (!expandable?.expandedRowRender) {
      return;
    }

    const key = getRecordKey(record, index, rowKey);
    const keyString = String(key);
    const expanded = !expandedKeySet.has(keyString);
    const nextKeys = expanded
      ? [...expandedKeys, key]
      : expandedKeys.filter((expandedKey) => String(expandedKey) !== keyString);

    if (expandable.expandedRowKeys === undefined) {
      setInternalExpandedKeys(nextKeys);
    }

    expandable.onExpand?.(expanded, record);
    expandable.onExpandedRowsChange?.(nextKeys);
  }

  function renderSelectionHeader() {
    if (!rowSelection) {
      return null;
    }

    if (rowSelection.type === "radio" || rowSelection.hideSelectAll) {
      return (
        <th className={cn(tableHeaderCellClass, tableSelectionCellClass)}>
          {rowSelection.columnTitle}
        </th>
      );
    }

    const pageKeys = pageData.map((record, index) => getRecordKey(record, index, rowKey));
    const allSelected =
      pageKeys.length > 0 &&
      pageKeys.every((key) => selectedKeySet.has(String(key)));

    return (
      <th className={cn(tableHeaderCellClass, tableSelectionCellClass)}>
        <label>
          <input
            type="checkbox"
            aria-label="Select all rows"
            checked={allSelected}
            onChange={toggleAllRows}
          />
          {hasNode(rowSelection.columnTitle) ? rowSelection.columnTitle : null}
        </label>
      </th>
    );
  }

  function renderHeaderCell(cell: HeaderCell<T>, index: number) {
    const { column } = cell;
    const title = column.title ?? dataIndexKey(column.dataIndex) ?? index + 1;
    const sortOrder = sortOrderFor(column, sortStates);
    const headerProps = column.onHeaderCell?.(column) ?? {};

    return (
      <th
        {...headerProps}
        key={String(column.columnKey)}
        className={cn(tableHeaderCellClass, column.className, headerProps.className)}
        colSpan={cell.colSpan}
        rowSpan={cell.rowSpan}
        style={{
          width: column.width,
          textAlign: column.align,
          ...headerProps.style,
        }}
      >
        <span>{title}</span>
        {column.sorter ? (
          <button
            type="button"
            className={getTableSorterClasses(Boolean(sortOrder))}
            aria-label={`Sort ${textFromNode(title, String(column.columnKey))}`}
            onClick={() => changeSorter(column)}
          >
            {sortOrder === "ascend" ? "Asc" : sortOrder === "descend" ? "Desc" : "Sort"}
          </button>
        ) : null}
        {column.filters?.length ? (
          <select
            className={tableFilterClass}
            aria-label={`Filter ${textFromNode(title, String(column.columnKey))}`}
            multiple={column.filterMultiple !== false}
            value={
              column.filterMultiple === false
                ? String((filterValueFor(column, filterStates) ?? [])[0] ?? "")
                : (filterValueFor(column, filterStates) ?? []).map(String)
            }
            onChange={(event) => changeFilter(column, event)}
          >
            {column.filterMultiple === false ? <option value="">All</option> : null}
            {optionValues(column.filters).map((filter) => (
              <option key={String(filter.value)} value={String(filter.value)}>
                {filter.text}
              </option>
            ))}
          </select>
        ) : null}
      </th>
    );
  }

  function renderCell(record: T, recordIndex: number, column: NormalizedColumn<T>) {
    const value = getValue(record, column.dataIndex);
    const rendered = column.render
      ? column.render(value, record, recordIndex)
      : (value as ReactNode);
    const cellProps = column.onCell?.(record, recordIndex) ?? {};

    return (
      <td
        {...cellProps}
        key={String(column.columnKey)}
        className={cn(tableCellClass, column.className, cellProps.className)}
        style={{ textAlign: column.align, ...cellProps.style }}
      >
        {hasNode(rendered) ? rendered : null}
      </td>
    );
  }

  function renderSelectionCell(record: T, index: number) {
    if (!rowSelection) {
      return null;
    }

    const key = getRecordKey(record, index, rowKey);
    const checked = selectedKeySet.has(String(key));
    const checkboxProps = rowSelection.getCheckboxProps?.(record) ?? {};
    const originNode = (
      <input
        {...checkboxProps}
        type={rowSelection.type === "radio" ? "radio" : "checkbox"}
        aria-label={`Select row ${index + 1}`}
        checked={checked}
        onChange={(event) => toggleRowSelection(record, index, event)}
      />
    );

    return (
      <td className={cn(tableCellClass, tableSelectionCellClass)}>
        {rowSelection.renderCell
          ? rowSelection.renderCell(checked, record, index, originNode)
          : originNode}
      </td>
    );
  }

  function renderExpandCell(record: T, index: number) {
    if (!expandable?.expandedRowRender) {
      return null;
    }

    const key = getRecordKey(record, index, rowKey);
    const expanded = expandedKeySet.has(String(key));
    const expandableRow = expandable.rowExpandable?.(record) ?? true;

    return (
      <td className={cn(tableCellClass, tableExpandCellClass)}>
        {expandableRow ? (
          <button
            type="button"
            className={tableExpandButtonClass}
            aria-label={`${expanded ? "Collapse" : "Expand"} row ${index + 1}`}
            onClick={() => toggleExpand(record, index)}
          >
            {expanded ? "-" : "+"}
          </button>
        ) : null}
      </td>
    );
  }

  function renderRow(record: T, index: number) {
    const key = getRecordKey(record, index, rowKey);
    const expanded = expandedKeySet.has(String(key));
    const selected = selectedKeySet.has(String(key));
    const row = (
      <tr
        key={String(key)}
        className={getTableRowClasses({ selected, expanded })}
        onClick={() => {
          if (expandable?.expandRowByClick) {
            toggleExpand(record, index);
          }
        }}
      >
        {renderSelectionCell(record, index)}
        {renderExpandCell(record, index)}
        {leaves.map((column) => renderCell(record, index, column))}
      </tr>
    );

    if (!expanded || !expandable?.expandedRowRender) {
      return row;
    }

    return (
      <React.Fragment key={String(key)}>
        {row}
        <tr className="table-expanded-row">
          <td className={tableCellClass} colSpan={structuralColumnCount}>
            {expandable.expandedRowRender(record, index, 0, expanded)}
          </td>
        </tr>
      </React.Fragment>
    );
  }

  const tableNode = (
    <table className={getTableClasses({ bordered, size })} style={{ tableLayout }}>
      <thead>
        {headerRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {rowIndex === 0 ? renderSelectionHeader() : null}
            {rowIndex === 0 && hasExpandable ? (
              <th className={cn(tableHeaderCellClass, tableExpandCellClass)}>
                {expandable?.columnTitle}
              </th>
            ) : null}
            {row.map(renderHeaderCell)}
          </tr>
        ))}
      </thead>
      <tbody>
        {bodyEmpty ? (
          <tr>
            <td className={tableEmptyClass} colSpan={structuralColumnCount}>
              {locale?.emptyText ?? "No data"}
            </td>
          </tr>
        ) : (
          pageData.map(renderRow)
        )}
      </tbody>
      {renderSummary(summary, pageData, structuralColumnCount)}
    </table>
  );

  return (
    <div
      {...props}
      ref={ref}
      className={getTableWrapperClasses({ loading: spinning, className })}
    >
      {scroll?.x || scroll?.y ? (
        <div
          style={{
            overflow: "auto",
            maxHeight: scroll.y,
            width: scroll.x === true ? "100%" : scroll.x,
          }}
        >
          {tableNode}
        </div>
      ) : (
        tableNode
      )}
      {spinning ? (
        <div className={tableLoadingIndicatorClass} role="status">
          {typeof loading === "object" && loading.indicator
            ? loading.indicator
            : "Loading"}
        </div>
      ) : null}
      {paginationConfig &&
      !(paginationConfig.hideOnSinglePage && pageCount <= 1) ? (
        <nav className={tablePaginationClass} aria-label="Table pagination">
          <button
            type="button"
            className={tablePaginationButtonClass}
            disabled={paginationConfig.disabled || current <= 1}
            onClick={() => changePage(current - 1)}
          >
            Previous
          </button>
          <span className={tablePaginationInfoClass}>
            {paginationConfig.showTotal
              ? paginationConfig.showTotal(paginationConfig.total ?? sortedData.length, [
                  bodyEmpty ? 0 : (current - 1) * pageSize + 1,
                  Math.min(current * pageSize, sortedData.length),
                ])
              : `${current} / ${pageCount}`}
          </span>
          <button
            type="button"
            className={tablePaginationButtonClass}
            disabled={paginationConfig.disabled || current >= pageCount}
            onClick={() => changePage(current + 1)}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  );
}

const TableWithRef = forwardRef(TableRoot) as unknown as <T = TableRecord>(
  props: TableProps<T> & React.RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export const Table = Object.assign(TableWithRef, {
  Column,
  ColumnGroup,
  Summary,
  SELECTION_ALL: "SELECT_ALL" as const,
  SELECTION_INVERT: "SELECT_INVERT" as const,
  SELECTION_NONE: "SELECT_NONE" as const,
  SELECTION_COLUMN: "SELECTION_COLUMN" as const,
  EXPAND_COLUMN: "EXPAND_COLUMN" as const,
}) as TableComponent;

Table.displayName = "Table";
