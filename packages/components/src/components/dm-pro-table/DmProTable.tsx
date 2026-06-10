import React from "react";
import {
  dmProTableColumnSettingClass,
  dmProTableHeaderClass,
  dmProTableTitleClass,
  dmProTableToolbarClass,
  getDmProTableClasses,
} from "../../classes/dm-pro-table";
import { Button } from "../button";
import { DmProTableInner } from "../dm-pro-table-inner";
import { DmToolbar } from "../dm-toolbar";
import type { TableRecord } from "../table/Table.types";
import type { DmProTableProps } from "./DmProTable.types";

function renderToolbar(toolBarRender: DmProTableProps["toolBarRender"]) {
  if (typeof toolBarRender === "function") return toolBarRender();
  return toolBarRender;
}

export function DmProTable<T extends TableRecord = TableRecord>({
  headerTitle,
  toolBarRender,
  toolbarItems,
  showTitleBar = true,
  columnSettingVisible,
  className,
  ...props
}: DmProTableProps<T>) {
  return (
    <div className={getDmProTableClasses({ className })}>
      {showTitleBar ? (
        <div className={dmProTableHeaderClass}>
          <div className={dmProTableTitleClass}>{headerTitle}</div>
          <div className={dmProTableToolbarClass}>
            {toolbarItems?.length ? <DmToolbar items={toolbarItems} /> : renderToolbar(toolBarRender)}
            {columnSettingVisible ? (
              <Button
                type="button"
                color="secondary"
                appearance="outline"
                className={dmProTableColumnSettingClass}
              >
                Columns
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      <DmProTableInner
        {...props}
        columnSettingVisible={showTitleBar ? false : columnSettingVisible}
      />
    </div>
  );
}

DmProTable.displayName = "DmProTable";
