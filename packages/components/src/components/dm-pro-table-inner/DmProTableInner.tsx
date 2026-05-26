import React from "react";
import { getDmProTableInnerClasses } from "../../classes/dm-pro-table-inner";
import { DmTable } from "../dm-table";
import type { TableRecord } from "../table/Table.types";
import type { DmProTableInnerProps } from "./DmProTableInner.types";

export function DmProTableInner<T extends TableRecord = TableRecord>({
  rowData,
  className,
  ...props
}: DmProTableInnerProps<T>) {
  return (
    <DmTable
      {...props}
      className={getDmProTableInnerClasses({ className })}
      dataSource={rowData}
    />
  );
}

DmProTableInner.displayName = "DmProTableInner";
