import React, { forwardRef, useState } from "react";
import {
  getMenuClasses,
  getMenuItemClasses,
  menuDividerClass,
  menuItemIconClass,
  menuItemTrailingClass,
  menuLabelClass,
  menuSubmenuClass,
} from "../../classes/menu";
import { cn } from "../../utils";
import type {
  MenuClickInfo,
  MenuComponent,
  MenuDividerProps,
  MenuItemGroupProps,
  MenuItemProps,
  MenuItemType,
  MenuKey,
  MenuProps,
} from "./Menu.types";

function normalizeKeys(keys?: MenuKey[]) {
  return keys?.map(String) ?? [];
}

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function keyForItem(item: MenuItemType, indexPath: number[]) {
  return String(item.key ?? indexPath.join("-"));
}

function isActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  (
    {
      children,
      icon,
      extra,
      active,
      disabled,
      danger,
      className,
      role,
      ...props
    },
    ref,
  ) => (
    <li
      {...props}
      ref={ref}
      role={role ?? "menuitem"}
      aria-disabled={disabled || undefined}
      className={getMenuItemClasses({
        active,
        disabled,
        danger,
        className,
      })}
    >
      {icon ? <span className={menuItemIconClass}>{icon}</span> : null}
      <span>{children}</span>
      {extra ? <span className={menuItemTrailingClass}>{extra}</span> : null}
    </li>
  ),
);

MenuItem.displayName = "Menu.Item";

const MenuDivider = forwardRef<HTMLLIElement, MenuDividerProps>(
  ({ className, ...props }, ref) => (
    <li
      {...props}
      ref={ref}
      role="separator"
      className={cn(menuDividerClass, className)}
    />
  ),
);

MenuDivider.displayName = "Menu.Divider";

const MenuItemGroup = forwardRef<HTMLLIElement, MenuItemGroupProps>(
  ({ title, children, className, ...props }, ref) => (
    <li {...props} ref={ref} className={cn("menu-group", className)}>
      {hasNode(title) ? <div className={menuLabelClass}>{title}</div> : null}
      <ul className={cn(menuSubmenuClass, "menu-show")}>{children}</ul>
    </li>
  ),
);

MenuItemGroup.displayName = "Menu.ItemGroup";

const MenuRoot = forwardRef<HTMLUListElement, MenuProps>(
  (
    {
      items,
      children,
      selectedKeys,
      defaultSelectedKeys,
      openKeys,
      defaultOpenKeys,
      mode = "vertical",
      theme = "light",
      size = "md",
      selectable = true,
      multiple,
      inlineCollapsed,
      disabled,
      onClick,
      onSelect,
      onDeselect,
      onOpenChange,
      className,
      ...props
    },
    ref,
  ) => {
    const selectedControlled = selectedKeys !== undefined;
    const openControlled = openKeys !== undefined;
    const [internalSelectedKeys, setInternalSelectedKeys] = useState(() =>
      normalizeKeys(defaultSelectedKeys),
    );
    const [internalOpenKeys, setInternalOpenKeys] = useState(() =>
      normalizeKeys(defaultOpenKeys),
    );
    const currentSelectedKeys = selectedControlled
      ? normalizeKeys(selectedKeys)
      : internalSelectedKeys;
    const currentOpenKeys = openControlled
      ? normalizeKeys(openKeys)
      : internalOpenKeys;

    function setNextSelectedKeys(nextSelectedKeys: string[]) {
      if (!selectedControlled) {
        setInternalSelectedKeys(nextSelectedKeys);
      }
    }

    function setNextOpenKeys(nextOpenKeys: string[]) {
      if (!openControlled) {
        setInternalOpenKeys(nextOpenKeys);
      }

      onOpenChange?.(nextOpenKeys);
    }

    function buildInfo(
      item: MenuItemType,
      key: string,
      keyPath: string[],
      domEvent: MenuClickInfo["domEvent"],
      nextSelectedKeys = currentSelectedKeys,
    ): MenuClickInfo {
      return {
        key,
        keyPath,
        item,
        selectedKeys: nextSelectedKeys,
        domEvent,
      };
    }

    function activateItem(
      item: MenuItemType,
      key: string,
      keyPath: string[],
      event: MenuClickInfo["domEvent"],
    ) {
      if (disabled || item.disabled) {
        event.preventDefault();
        return;
      }

      let nextSelectedKeys = currentSelectedKeys;
      const selected = currentSelectedKeys.includes(key);

      if (selectable) {
        if (selected && multiple) {
          nextSelectedKeys = currentSelectedKeys.filter(
            (selectedKey) => selectedKey !== key,
          );
          setNextSelectedKeys(nextSelectedKeys);
          onDeselect?.(buildInfo(item, key, keyPath, event, nextSelectedKeys));
        } else if (!selected) {
          nextSelectedKeys = multiple ? [...currentSelectedKeys, key] : [key];
          setNextSelectedKeys(nextSelectedKeys);
          onSelect?.(buildInfo(item, key, keyPath, event, nextSelectedKeys));
        }
      }

      onClick?.(buildInfo(item, key, keyPath, event, nextSelectedKeys));
    }

    function toggleSubmenu(key: string) {
      const open = currentOpenKeys.includes(key);
      setNextOpenKeys(
        open
          ? currentOpenKeys.filter((openKey) => openKey !== key)
          : [...currentOpenKeys, key],
      );
    }

    function renderItem(
      item: MenuItemType,
      indexPath: number[],
      parentKeyPath: string[] = [],
    ): React.ReactNode {
      if (item.type === "divider") {
        return <MenuDivider key={`divider-${indexPath.join("-")}`} />;
      }

      const key = keyForItem(item, indexPath);
      const keyPath = [key, ...parentKeyPath];

      if (item.type === "group") {
        return (
          <MenuItemGroup key={key} title={item.label ?? item.title}>
            {item.children?.map((child, childIndex) =>
              renderItem(child, [...indexPath, childIndex], keyPath),
            )}
          </MenuItemGroup>
        );
      }

      const hasChildren = Boolean(item.children?.length);
      const selected = currentSelectedKeys.includes(key);
      const open = currentOpenKeys.includes(key);
      const itemDisabled = disabled || item.disabled;

      if (hasChildren) {
        return (
          <li key={key} className={cn("menu-submenu-wrapper", item.className)}>
            <button
              type="button"
              className={getMenuItemClasses({
                active: selected,
                disabled: itemDisabled,
                danger: item.danger,
                submenu: true,
              })}
              disabled={itemDisabled}
              aria-expanded={open}
              onClick={() => toggleSubmenu(key)}
            >
              {item.icon ? (
                <span className={menuItemIconClass}>{item.icon}</span>
              ) : null}
              <span>{item.label ?? item.title}</span>
              {item.extra ? (
                <span className={menuItemTrailingClass}>{item.extra}</span>
              ) : null}
            </button>
            {open ? (
              <ul className={cn(menuSubmenuClass, "menu-show")}>
                {item.children?.map((child, childIndex) =>
                  renderItem(child, [...indexPath, childIndex], keyPath),
                )}
              </ul>
            ) : null}
          </li>
        );
      }

      return (
        <MenuItem
          key={key}
          role="menuitem"
          tabIndex={itemDisabled ? undefined : 0}
          active={selected}
          disabled={itemDisabled}
          danger={item.danger}
          icon={item.icon}
          extra={item.extra}
          className={item.className}
          onClick={(event) => activateItem(item, key, keyPath, event)}
          onKeyDown={(event) => {
            if (!isActivationKey(event.key)) {
              return;
            }

            event.preventDefault();
            activateItem(item, key, keyPath, event);
          }}
        >
          {item.label}
        </MenuItem>
      );
    }

    return (
      <ul
        {...props}
        ref={ref}
        role={props.role ?? "menu"}
        className={getMenuClasses({
          mode,
          theme,
          size,
          inlineCollapsed,
          disabled,
          className,
        })}
      >
        {items
          ? items.map((item, index) => renderItem(item, [index]))
          : children}
      </ul>
    );
  },
) as MenuComponent;

MenuRoot.displayName = "Menu";
MenuRoot.Item = MenuItem;
MenuRoot.Divider = MenuDivider;
MenuRoot.ItemGroup = MenuItemGroup;

export const Menu = MenuRoot;
