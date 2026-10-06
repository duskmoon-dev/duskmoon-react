import React, { forwardRef, useMemo } from "react";
import {
  dmMenuCollapseButtonClass,
  dmMenuContentClass,
  dmMenuFooterClass,
  dmMenuHeaderClass,
  dmMenuProductIconClass,
  getDmMenuClasses,
} from "../../classes/dm-menu";
import { Menu } from "../menu";
import { Button } from "../button";
import type { MenuItemType } from "../menu/Menu.types";
import type {
  DmMenuClickInfo,
  DmMenuProps,
  DmMenuSchema,
} from "./DmMenu.types";

function getMenuLabel(menu: DmMenuSchema, locale?: string) {
  return locale === "en-US" && menu.menuNameEn
    ? menu.menuNameEn
    : menu.menuName;
}

function renderIcon(icon: React.ReactNode) {
  if (!icon) return undefined;
  return typeof icon === "string" ? (
    <span className={dmMenuProductIconClass} aria-hidden="true">
      {icon}
    </span>
  ) : (
    icon
  );
}

function isEnabled(menu: DmMenuSchema) {
  return menu.enable !== false;
}

function toMenuItems(
  menus: DmMenuSchema[] | undefined,
  locale?: string,
  byKey?: Map<string, DmMenuSchema>,
): MenuItemType[] {
  return (menus ?? [])
    .filter((menu) => !menu.subRouter && isEnabled(menu))
    .sort((a, b) => (a.menuNum ?? 0) - (b.menuNum ?? 0))
    .map((menu) => {
      const key = menu.menuUrl || String(menu.menuId ?? menu.menuIdentifier);
      byKey?.set(key, menu);

      return {
        key,
        label: getMenuLabel(menu, locale),
        title: getMenuLabel(menu, locale),
        icon: renderIcon(menu.iconStr),
        children: toMenuItems(menu.children, locale, byKey),
      };
    });
}

export function createDmMenuItems(
  menus: DmMenuSchema[] | undefined,
  locale?: string,
) {
  return toMenuItems(menus, locale);
}

function presentMenuItem(
  item: MenuItemType,
  collapsed?: boolean,
): MenuItemType {
  if (item.type === "divider") return item;
  const label = item.label ?? item.title;
  const initial = typeof label === "string" ? label.trim().slice(0, 1) : "";
  return {
    ...item,
    label: <span className="dm-menu-item-label">{label}</span>,
    icon:
      item.icon || collapsed ? (
        <span aria-hidden="true" className="dm-menu-item-symbol">
          {item.icon || (
            <span className="dm-menu-item-initial">{initial || "•"}</span>
          )}
        </span>
      ) : undefined,
    children: item.children?.map((child) => presentMenuItem(child, collapsed)),
  };
}

export const DmMenu = forwardRef<HTMLDivElement, DmMenuProps>(
  (
    {
      menus = [],
      items,
      hideProductHeader = false,
      productTitle = "DuskMoon",
      productIcon,
      inlineCollapsed,
      onCollapsed,
      locale,
      onClick,
      className,
      ...props
    },
    ref,
  ) => {
    const menuByKey = useMemo(() => new Map<string, DmMenuSchema>(), []);
    const schemaItems = useMemo(() => {
      menuByKey.clear();
      return toMenuItems(menus, locale, menuByKey);
    }, [locale, menuByKey, menus]);
    const contentItems = (items ?? schemaItems).map((item) =>
      presentMenuItem(item, inlineCollapsed),
    );

    function handleClick(info: DmMenuClickInfo) {
      onClick?.({
        ...info,
        menu: menuByKey.get(info.key),
      });
    }

    return (
      <div
        ref={ref}
        className={getDmMenuClasses({
          hideProductHeader,
          inlineCollapsed,
          className,
        })}
      >
        {hideProductHeader ? null : (
          <div className={dmMenuHeaderClass}>
            <Menu
              mode="inline"
              inlineCollapsed={inlineCollapsed}
              selectable={false}
              items={[
                presentMenuItem(
                  {
                    key: "__product",
                    label: productTitle,
                    title: productTitle,
                    icon: renderIcon(productIcon),
                  },
                  inlineCollapsed,
                ),
              ]}
            />
          </div>
        )}
        <div className={dmMenuContentClass}>
          <Menu
            {...props}
            mode={props.mode ?? "inline"}
            items={contentItems}
            inlineCollapsed={inlineCollapsed}
            onClick={handleClick}
          />
        </div>
        {onCollapsed ? (
          <div className={dmMenuFooterClass}>
            <Button
              type="button"
              color="base"
              appearance="ghost"
              shape="square"
              size="sm"
              className={dmMenuCollapseButtonClass}
              aria-label={inlineCollapsed ? "Expand menu" : "Collapse menu"}
              onClick={onCollapsed}
            >
              <svg
                aria-hidden="true"
                focusable="false"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d={inlineCollapsed ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"}
                />
              </svg>
            </Button>
          </div>
        ) : null}
      </div>
    );
  },
);

DmMenu.displayName = "DmMenu";
