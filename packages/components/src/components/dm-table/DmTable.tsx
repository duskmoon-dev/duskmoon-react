import React, { useMemo, useState } from "react";
import {
  dmTableCardClass,
  dmTableColumnSettingClass,
  dmTableExtraClass,
  dmTableHeaderClass,
  dmTableIndicatorsClass,
  dmTablePaginationClass,
  dmTableSearchClass,
  dmTableTableExtraClass,
  dmTableTitleClass,
  getDmTableClasses,
} from "../../classes/dm-table";
import { Button } from "../button";
import { Card } from "../card";
import { DmPagination } from "../dm-pagination";
import { DmSearch } from "../dm-search";
import { Table } from "../table";
import type { TableRecord } from "../table/Table.types";
import type {
  DmTableColumnType,
  DmTableColumnsType,
  DmTableProps,
} from "./DmTable.types";

function mapAndFilter<T, R>(
  list: T[],
  mapper: (value: T, index: number) => R | false | null | undefined,
) {
  return list.map(mapper).filter((item): item is R => item !== false && item != null);
}

export function filterDmTableColumn<T>(
  column: DmTableColumnType<T>,
): DmTableColumnType<T> | false | null {
  if (column.onlySearch || column.hideInTable) return false;
  if (Array.isArray(column.children)) {
    const children = mapAndFilter(column.children, filterDmTableColumn);
    return children.length > 0 ? { ...column, children } : null;
  }
  return column;
}

function filterSearchColumn<T>(
  column: DmTableColumnType<T>,
): DmTableColumnType<T> | false | null {
  if (Array.isArray(column.children)) {
    const children = mapAndFilter(column.children, filterSearchColumn);
    return children.length > 0 ? { ...column, children } : null;
  }
  return column.search ? column : false;
}

function flattenSearchColumns<T>(column: DmTableColumnType<T>): DmTableColumnType<T>[] {
  return Array.isArray(column.children)
    ? column.children.flatMap(flattenSearchColumns)
    : [column];
}

function searchItems<T>(columns: DmTableColumnsType<T>) {
  return mapAndFilter(columns, filterSearchColumn)
    .flatMap(flattenSearchColumns)
    .map((column) => ({
      key: String(column.key ?? column.dataIndex),
      title: column.title,
      dataIndex: String(column.dataIndex ?? column.key),
      search: column.search || { type: "input" as const, extraProps: {}, formProps: {} },
    }));
}

export function DmTable<T extends TableRecord = TableRecord>({
  name,
  extra,
  indicators,
  pagination,
  columns: inputColumns,
  columnSettingVisible = true,
  onColumnsChange,
  columnState,
  searchProps,
  tableExtra,
  className,
  dataSource,
  rowSelection,
  ...props
}: DmTableProps<T>) {
  const tableColumns = useMemo(
    () => mapAndFilter(inputColumns, filterDmTableColumn),
    [inputColumns],
  );
  const [columns, setColumns] = useState(tableColumns);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const items = searchProps?.items?.length
    ? searchProps.items
    : searchItems(inputColumns);
  const paginationObj = typeof pagination === "object" ? pagination : undefined;
  const { ref: _paginationRef, ...paginationProps } = paginationObj ?? {};
  const total = paginationObj?.total ?? dataSource?.length ?? 0;
  const selectedTotal = rowSelection?.selectedRowKeys?.length ?? 0;

  function resetColumns() {
    setColumns(tableColumns);
    onColumnsChange?.(tableColumns);
    if (columnState?.persistenceKey) {
      globalThis.localStorage?.removeItem(columnState.persistenceKey);
    }
  }

  return (
    <div className={getDmTableClasses({ className })}>
      {items.length > 0 || searchProps?.fastFilterItem ? (
        <Card className={dmTableSearchClass} padding="md">
          <DmSearch {...searchProps} items={items} />
        </Card>
      ) : null}
      {indicators ? <div className={dmTableIndicatorsClass}>{indicators}</div> : null}
      <Card className={dmTableCardClass} padding="md">
        {name || extra || columnSettingVisible ? (
          <div className={dmTableHeaderClass}>
            <div className={dmTableTitleClass}>{name}</div>
            <div className={dmTableExtraClass}>
              {extra}
              {columnSettingVisible ? (
                <Button
                  type="button"
                  color="secondary"
                  appearance="outline"
                  className={dmTableColumnSettingClass}
                  onClick={() => setColumnSettingsOpen((open) => !open)}
                >
                  Columns
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {columnSettingsOpen ? (
          <div role="dialog" aria-label="Column settings">
            <Button type="button" onClick={resetColumns}>
              Reset columns
            </Button>
          </div>
        ) : null}
        {tableExtra ? <div className={dmTableTableExtraClass}>{tableExtra}</div> : null}
        <Table
          {...props}
          dataSource={dataSource}
          rowSelection={rowSelection}
          size={props.size ?? "small"}
          scroll={props.scroll ?? { x: 680 }}
          columns={columns}
          pagination={
            pagination
              ? {
                  current: paginationObj?.current,
                  defaultCurrent: paginationObj?.defaultCurrent,
                  pageSize: paginationObj?.pageSize,
                  defaultPageSize: paginationObj?.defaultPageSize,
                  total,
                  onChange: paginationObj?.onChange,
                }
              : false
          }
        />
        {pagination ? (
          <DmPagination
            {...paginationProps}
            className={dmTablePaginationClass}
            total={total}
            selectedTotal={selectedTotal}
            showSizeChanger
          />
        ) : null}
      </Card>
    </div>
  );
}

DmTable.displayName = "DmTable";
