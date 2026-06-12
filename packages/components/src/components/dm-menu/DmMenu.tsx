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
    const contentItems = items ?? schemaItems;

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
                {
                  key: "__product",
                  label: productTitle,
                  title: productTitle,
                  icon: renderIcon(productIcon),
                },
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
            <button
              type="button"
              className={dmMenuCollapseButtonClass}
              aria-label={inlineCollapsed ? "Expand menu" : "Collapse menu"}
              onClick={onCollapsed}
            >
              {inlineCollapsed ? ">" : "<"}
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

DmMenu.displayName = "DmMenu";
