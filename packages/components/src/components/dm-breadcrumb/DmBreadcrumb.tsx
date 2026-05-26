import React, { forwardRef, useEffect, useMemo, useState } from "react";
import {
  dmBreadcrumbValueClass,
  getDmBreadcrumbClasses,
} from "../../classes/dm-breadcrumb";
import { Breadcrumb } from "../breadcrumb";
import type { BreadcrumbItemType } from "../breadcrumb/Breadcrumb.types";
import type {
  DmBreadcrumbHistoryItem,
  DmBreadcrumbItem,
  DmBreadcrumbProps,
} from "./DmBreadcrumb.types";

const defaultStorageKey = "dm-breadcrumb-history-list";
const defaultMaxHistoryLength = 10;

function canUseSessionStorage() {
  return (
    typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
  );
}

function readHistory(storageKey: string): DmBreadcrumbHistoryItem[] {
  if (!canUseSessionStorage()) return [];

  try {
    const raw = window.sessionStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(storageKey: string, history: DmBreadcrumbHistoryItem[]) {
  if (!canUseSessionStorage()) return;

  window.sessionStorage.setItem(storageKey, JSON.stringify(history));
}

function currentLocation(): DmBreadcrumbHistoryItem | undefined {
  if (typeof window === "undefined") return undefined;

  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function upsertHistory(
  history: DmBreadcrumbHistoryItem[],
  item: DmBreadcrumbHistoryItem,
  maxLength: number,
) {
  const nextHistory = history.filter(
    (entry) => entry.pathname !== item.pathname,
  );

  return [...nextHistory, item].slice(-maxLength);
}

function resolveRecentUrl(
  item: DmBreadcrumbItem,
  history: DmBreadcrumbHistoryItem[],
  isStoragePath: boolean,
) {
  const baseUrl = item.url ?? item.href ?? "";

  if (!isStoragePath || !item.url) return baseUrl;

  const recent = history.find((entry) => entry.pathname === item.url);
  return recent ? `${recent.pathname}${recent.search ?? ""}` : baseUrl;
}

function renderTitle(item: DmBreadcrumbItem, index: number) {
  if (item.itemRender) return item.itemRender(item);

  return (
    <span title={typeof item.title === "string" ? item.title : undefined}>
      {item.title}
      {item.value !== undefined && index > 0 ? (
        <span className={dmBreadcrumbValueClass}>({item.value})</span>
      ) : null}
    </span>
  );
}

function collapseItems(
  items: BreadcrumbItemType[],
  maxVisibleItems: number | undefined,
): BreadcrumbItemType[] {
  if (!maxVisibleItems || items.length <= maxVisibleItems || maxVisibleItems < 3) {
    return items;
  }

  const headCount = 2;
  const tailCount = Math.max(1, maxVisibleItems - headCount - 1);

  return [
    ...items.slice(0, headCount),
    { type: "separator", key: "__dm-breadcrumb-ellipsis", separator: "..." },
    ...items.slice(-tailCount),
  ];
}

export const DmBreadcrumb = forwardRef<HTMLElement, DmBreadcrumbProps>(
  (
    {
      items,
      isStoragePath = true,
      storageKey = defaultStorageKey,
      maxHistoryLength = defaultMaxHistoryLength,
      maxVisibleItems,
      compact,
      history,
      className,
      separator,
      ...props
    },
    ref,
  ) => {
    const [currentHistory, setCurrentHistory] = useState<DmBreadcrumbHistoryItem[]>(
      () => history ?? readHistory(storageKey),
    );

    useEffect(() => {
      if (history) {
        setCurrentHistory(history);
      }
    }, [history]);

    useEffect(() => {
      if (!isStoragePath || history) return;

      const locationItem = currentLocation();
      if (!locationItem) return;

      setCurrentHistory((prevHistory) => {
        const nextHistory = upsertHistory(
          prevHistory,
          locationItem,
          maxHistoryLength,
        );
        writeHistory(storageKey, nextHistory);
        return nextHistory;
      });
    }, [history, isStoragePath, maxHistoryLength, storageKey]);

    const breadcrumbItems = useMemo(() => {
      const mappedItems: BreadcrumbItemType[] = items.map((item, index) => {
        const url = resolveRecentUrl(item, currentHistory, isStoragePath);

        return {
          key: item.url ?? item.href ?? index,
          title: renderTitle(item, index),
          href: item.onClick ? undefined : url || undefined,
          menu: item.menu,
          onClick: item.onClick
            ? (event) => {
                event.preventDefault();
                item.onClick?.(url);
              }
            : undefined,
        };
      });

      return collapseItems(mappedItems, maxVisibleItems);
    }, [currentHistory, isStoragePath, items, maxVisibleItems]);

    return (
      <Breadcrumb
        {...props}
        ref={ref}
        items={breadcrumbItems}
        separator={separator}
        className={getDmBreadcrumbClasses({
          compact,
          recent: isStoragePath,
          className,
        })}
      />
    );
  },
);

DmBreadcrumb.displayName = "DmBreadcrumb";

