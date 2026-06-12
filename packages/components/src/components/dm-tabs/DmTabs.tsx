import React, { forwardRef } from "react";
import { getDmTabsClasses, getDmTabsShellClasses } from "../../classes/dm-tabs";
import { Tabs } from "../tabs";
import type { DmTabsProps } from "./DmTabs.types";

export const DmTabs = forwardRef<HTMLDivElement, DmTabsProps>(
  (
    {
      type = "line",
      tabPosition = "top",
      transparentCard = false,
      optionTree = false,
      destroyOnHidden = true,
      destroyInactiveTabPane,
      className,
      style,
      items,
      ...props
    },
    ref,
  ) => (
    <div className={getDmTabsShellClasses({})} style={style}>
      <Tabs
        {...props}
        ref={ref}
        items={items}
        type={type}
        tabPosition={tabPosition}
        destroyInactiveTabPane={destroyInactiveTabPane ?? destroyOnHidden}
        className={getDmTabsClasses({
          type,
          tabPosition,
          transparentCard,
          optionTree,
          className,
        })}
      />
    </div>
  ),
);

DmTabs.displayName = "DmTabs";
