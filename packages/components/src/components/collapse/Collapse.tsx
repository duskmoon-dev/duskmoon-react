import React, { forwardRef, useState } from "react";
import {
  collapseContentClass,
  collapseIconClass,
  collapseTriggerClass,
  getCollapseGroupClasses,
  getCollapseItemClasses,
} from "../../classes/collapse";
import type {
  CollapseItem,
  CollapseKey,
  CollapseProps,
} from "./Collapse.types";

function normalizeKeys(keys?: CollapseKey | CollapseKey[]) {
  if (keys === undefined) return [];
  return Array.isArray(keys) ? keys.map(String) : [String(keys)];
}

function denormalizeKeys(keys: string[], accordion?: boolean) {
  return accordion ? (keys[0] ?? "") : keys;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      items,
      activeKey,
      defaultActiveKey,
      onChange,
      accordion,
      bordered = true,
      ghost,
      size = "md",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = activeKey !== undefined;
    const [internalKeys, setInternalKeys] = useState(() =>
      normalizeKeys(defaultActiveKey),
    );
    const openKeys = isControlled ? normalizeKeys(activeKey) : internalKeys;
    const finalItems =
      items ??
      (children
        ? [{ key: "default", label: "", children }]
        : ([] as CollapseItem[]));

    function toggleItem(item: CollapseItem) {
      if (item.disabled) return;

      const itemKey = String(item.key);
      const isOpen = openKeys.includes(itemKey);
      const nextKeys = accordion
        ? isOpen
          ? []
          : [itemKey]
        : isOpen
          ? openKeys.filter((key) => key !== itemKey)
          : [...openKeys, itemKey];

      if (!isControlled) {
        setInternalKeys(nextKeys);
      }

      onChange?.(denormalizeKeys(nextKeys, accordion));
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getCollapseGroupClasses({ className })}
      >
        {finalItems.map((item) => {
          const itemKey = String(item.key);
          const open = openKeys.includes(itemKey);
          const contentId = `collapse-content-${itemKey}`;

          return (
            <div
              key={itemKey}
              className={getCollapseItemClasses({
                open,
                bordered,
                ghost,
                disabled: item.disabled,
                size,
                className: item.className,
              })}
            >
              <button
                type="button"
                className={collapseTriggerClass}
                aria-expanded={open}
                aria-controls={contentId}
                disabled={item.disabled}
                onClick={() => toggleItem(item)}
              >
                <span>{item.label}</span>
                <span className={collapseIconClass} aria-hidden="true">
                  v
                </span>
              </button>
              {open ? (
                <div id={contentId} className={collapseContentClass}>
                  <div>{item.children}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  },
);

Collapse.displayName = "Collapse";
