import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  dmLayoutAuxiliaryClass,
  dmLayoutBodyClass,
  dmLayoutBreadcrumbClass,
  dmLayoutContentClass,
  dmLayoutMainClass,
  dmLayoutShellClass,
  dmLayoutSiderClass,
  getDmLayoutClasses,
} from "../../classes/dm-layout";
import { Layout } from "../layout";
import { DmBreadcrumb } from "../dm-breadcrumb";
import type { DmBreadcrumbItem } from "../dm-breadcrumb/DmBreadcrumb.types";
import { DmMenu } from "../dm-menu";
import type { DmMenuSchema } from "../dm-menu/DmMenu.types";
import type { DmLayoutProps, DmLayoutSelection } from "./DmLayout.types";

function getLabel(menu: DmMenuSchema, locale?: string) {
  return locale === "en-US" && menu.menuNameEn
    ? menu.menuNameEn
    : menu.menuName;
}

function getAllMenuUrls(menus: DmMenuSchema[] = [], includeSubRoutes: boolean) {
  const urls: string[] = [];

  function visit(menu: DmMenuSchema) {
    if (includeSubRoutes || !menu.subRouter) {
      urls.push(menu.menuUrl);
    }

    menu.children?.forEach(visit);
  }

  menus.forEach(visit);
  return urls;
}

function findBestPrefix(urls: string[], selectedKey = "") {
  return urls
    .filter((url) => url && selectedKey.startsWith(url))
    .sort((a, b) => b.length - a.length)[0];
}

function findMenuPath(
  menus: DmMenuSchema[] | undefined,
  key: string,
  path: DmMenuSchema[] = [],
): DmMenuSchema[] | undefined {
  for (const menu of menus ?? []) {
    const nextPath = [...path, menu];

    if (menu.menuUrl === key) return nextPath;

    const childPath = findMenuPath(menu.children, key, nextPath);
    if (childPath) return childPath;
  }

  return undefined;
}

function getOpenKeysFromPath(path: DmMenuSchema[] | undefined) {
  return (path ?? [])
    .slice(0, -1)
    .filter((menu) => !menu.subRouter && menu.menuUrl)
    .map((menu) => menu.menuUrl);
}

function getAllTopOpenKeys(menus: DmMenuSchema[] = []) {
  return menus
    .filter((menu) => !menu.subRouter && menu.children?.length && menu.menuUrl)
    .map((menu) => menu.menuUrl);
}

function breadcrumbFromPath({
  path,
  locale,
  onBreadcrumbClick,
}: {
  path: DmMenuSchema[] | undefined;
  locale?: string;
  onBreadcrumbClick?: (url: string) => void;
}): DmBreadcrumbItem[] {
  return (path ?? []).map((menu, index, all) => {
    const active = index === all.length - 1;

    return {
      title: getLabel(menu, locale),
      url: active ? undefined : menu.menuUrl,
      onClick:
        !active && menu.menuUrl && onBreadcrumbClick
          ? () => onBreadcrumbClick(menu.menuUrl)
          : undefined,
    };
  });
}

function unique(keys: string[]) {
  return Array.from(new Set(keys.filter(Boolean)));
}

export function deriveDmLayoutSelection({
  menus = [],
  selectedKey = "",
  openAllKeys,
  locale,
  onBreadcrumbClick,
}: Pick<
  DmLayoutProps,
  "menus" | "selectedKey" | "openAllKeys" | "locale" | "onBreadcrumbClick"
>): DmLayoutSelection {
  const selectedMenuKey =
    findBestPrefix(getAllMenuUrls(menus, false), selectedKey) ?? "";
  const selectedBreadcrumbKey =
    findBestPrefix(getAllMenuUrls(menus, true), selectedKey) ?? selectedMenuKey;
  const selectedMenuPath = findMenuPath(menus, selectedMenuKey);
  const selectedBreadcrumbPath = findMenuPath(menus, selectedBreadcrumbKey);
  const selectOpenKeys = getOpenKeysFromPath(selectedMenuPath);
  const openKeys = openAllKeys
    ? unique([...getAllTopOpenKeys(menus), ...selectOpenKeys])
    : selectOpenKeys;
  const activeMenu =
    selectedBreadcrumbPath?.[selectedBreadcrumbPath.length - 1];

  return {
    selectedMenuKey,
    selectedBreadcrumbKey,
    openKeys,
    breadcrumbItems: breadcrumbFromPath({
      path: selectedBreadcrumbPath,
      locale,
      onBreadcrumbClick,
    }),
    tips:
      activeMenu?.tipsEnabled && locale === "en-US" && activeMenu.tipsEn
        ? activeMenu.tipsEn
        : activeMenu?.tipsEnabled
          ? activeMenu.tips
          : undefined,
  };
}

export const DmLayout = forwardRef<HTMLDivElement, DmLayoutProps>(
  (
    {
      menus = [],
      selectedKey = "",
      openAllKeys,
      collapsed,
      defaultCollapsed = false,
      hideProductHeader,
      productIcon,
      productTitle,
      breadcrumbItems,
      aheadBreadcrumbItems = [],
      behindBreadcrumbItems = [],
      tips,
      locale,
      menuProps,
      onCollapse,
      onMenuClick,
      onBreadcrumbClick,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const collapsedControlled = collapsed !== undefined;
    const [internalCollapsed, setInternalCollapsed] =
      useState(defaultCollapsed);
    const [manualOpenKeys, setManualOpenKeys] = useState<
      string[] | undefined
    >();
    const mergedCollapsed = collapsedControlled ? collapsed : internalCollapsed;
    const selection = useMemo(
      () =>
        deriveDmLayoutSelection({
          menus,
          selectedKey,
          openAllKeys,
          locale,
          onBreadcrumbClick,
        }),
      [locale, menus, onBreadcrumbClick, openAllKeys, selectedKey],
    );
    const mergedBreadcrumbItems =
      breadcrumbItems ??
      aheadBreadcrumbItems
        .concat(selection.breadcrumbItems)
        .concat(behindBreadcrumbItems);
    const mergedTips = tips ?? selection.tips;

    useEffect(() => {
      setManualOpenKeys(undefined);
    }, [menus, openAllKeys, selection.selectedMenuKey]);

    function handleCollapse() {
      const nextCollapsed = !mergedCollapsed;

      if (!collapsedControlled) {
        setInternalCollapsed(nextCollapsed);
      }

      onCollapse?.(nextCollapsed);
    }

    return (
      <Layout
        {...props}
        ref={ref}
        hasSider
        className={getDmLayoutClasses({ className })}
      >
        <Layout className={dmLayoutShellClass} hasSider>
          <Layout.Sider
            className={dmLayoutSiderClass}
            collapsible
            collapsed={mergedCollapsed}
            collapsedWidth={60}
            width={230}
            trigger={null}
          >
            <DmMenu
              {...menuProps}
              hideProductHeader={hideProductHeader}
              productTitle={productTitle}
              productIcon={productIcon}
              menus={menus}
              selectedKeys={[selection.selectedMenuKey]}
              openKeys={manualOpenKeys ?? selection.openKeys}
              inlineCollapsed={mergedCollapsed}
              locale={locale}
              onCollapsed={handleCollapse}
              onOpenChange={setManualOpenKeys}
              onClick={(info) => onMenuClick?.(info.key, info.menu)}
            />
          </Layout.Sider>
          <Layout className={dmLayoutMainClass}>
            {mergedBreadcrumbItems.length ? (
              <div className={dmLayoutBreadcrumbClass}>
                <DmBreadcrumb items={mergedBreadcrumbItems} />
              </div>
            ) : null}
            <Layout.Content className={dmLayoutBodyClass}>
              {mergedTips ? (
                <div className={dmLayoutAuxiliaryClass}>{mergedTips}</div>
              ) : null}
              <div className={dmLayoutContentClass}>{children}</div>
            </Layout.Content>
          </Layout>
        </Layout>
      </Layout>
    );
  },
);

DmLayout.displayName = "DmLayout";
