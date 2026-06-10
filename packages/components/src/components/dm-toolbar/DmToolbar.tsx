import React, { useMemo } from "react";
import {
  dmToolbarMoreClass,
  getDmToolbarClasses,
  getDmToolbarItemClasses,
} from "../../classes/dm-toolbar";
import { Button } from "../button";
import { Dropdown } from "../dropdown";
import type { DropdownMenu } from "../dropdown/Dropdown.types";
import type { DmToolbarItem, DmToolbarProps } from "./DmToolbar.types";

function isPrimary(item: DmToolbarItem) {
  return item.type === "primary";
}

function renderToolbarItem(item: DmToolbarItem, index: number) {
  const {
    title,
    menu,
    type,
    htmlType = "button",
    color,
    appearance,
    ...buttonPropsWithKey
  } = item;
  const buttonProps = { ...buttonPropsWithKey };

  delete (buttonProps as { key?: DmToolbarItem["key"] }).key;

  const button = (
    <Button
      {...buttonProps}
      type={htmlType}
      color={color ?? (type === "primary" ? "primary" : "secondary")}
      appearance={appearance ?? (type === "primary" ? "filled" : "outline")}
    >
      {title}
    </Button>
  );

  if (!menu?.items?.length) return button;

  return (
    <Dropdown key={`dropdown-${index}`} trigger={["click"]} menu={menu}>
      {button}
    </Dropdown>
  );
}

function toOverflowMenu(items: DmToolbarItem[]): DropdownMenu {
  return {
    items: items.map((item, index) => ({
      key: item.key ?? index,
      label: item.title,
      disabled: item.disabled,
    })),
    onClick: ({ key, domEvent }) => {
      const target = items.find((item, index) => String(item.key ?? index) === key);
      target?.onClick?.(domEvent);
    },
  };
}

export function DmToolbar({
  items = [],
  className,
  style,
  moreText = "More",
  maxVisibleSecondaryItems,
}: DmToolbarProps) {
  const { visibleSecondaryItems, overflowSecondaryItems, primaryItems } =
    useMemo(() => {
      const primaryItems = items.filter(isPrimary);
      const secondaryItems = items.filter((item) => !isPrimary(item));
      const visibleLimit =
        maxVisibleSecondaryItems === undefined
          ? secondaryItems.length
          : Math.max(0, maxVisibleSecondaryItems);
      const visibleSecondaryItems =
        visibleLimit === 0 ? [] : secondaryItems.slice(-visibleLimit);
      const overflowSecondaryItems =
        visibleLimit >= secondaryItems.length
          ? []
          : secondaryItems.slice(0, secondaryItems.length - visibleLimit);

      return { visibleSecondaryItems, overflowSecondaryItems, primaryItems };
    }, [items, maxVisibleSecondaryItems]);

  const showMore = overflowSecondaryItems.length > 0;

  return (
    <div className={getDmToolbarClasses({ className })} style={style}>
      {visibleSecondaryItems.map((item, index) => (
        <span
          key={item.key ?? `secondary-${index}`}
          className={getDmToolbarItemClasses({})}
        >
          {renderToolbarItem(item, index)}
        </span>
      ))}
      {showMore ? (
        <Dropdown trigger={["click"]} menu={toOverflowMenu(overflowSecondaryItems)}>
          <Button
            type="button"
            className={dmToolbarMoreClass}
            color="secondary"
            appearance="outline"
          >
            {moreText}
          </Button>
        </Dropdown>
      ) : null}
      {primaryItems.map((item, index) => (
        <span
          key={item.key ?? `primary-${index}`}
          className={getDmToolbarItemClasses({ primary: true })}
        >
          {renderToolbarItem(item, index)}
        </span>
      ))}
    </div>
  );
}

DmToolbar.displayName = "DmToolbar";
