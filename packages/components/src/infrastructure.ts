import { useCallback, useState } from "react";
import type { ComponentProps, ElementType, Ref } from "react";

export const version = "0.1.1";

export type GetProps<T extends ElementType> = ComponentProps<T>;
export type GetProp<T, K extends keyof T> = T[K];
export type GetRef<T> = T extends ElementType
  ? ComponentProps<T> extends { ref?: Ref<infer R> }
    ? R
    : never
  : never;

export const theme = {
  defaultSeed: {
    colorPrimary: "#0065ff",
  },
  useToken: () => ({
    token: getDmTheme().token,
    theme: getDmTheme(),
    hashId: "",
  }),
  getDesignToken: () => getDmTheme().token,
  defaultAlgorithm: "default",
  darkAlgorithm: "dark",
  compactAlgorithm: "compact",
};

let renderOverride:
  | ((node: unknown, container: Element | DocumentFragment) => void)
  | undefined;
let primaryColor = "#0065ff";
let prefixCls = "dm";
let datePickerLocale: "zh" | "en" = "en";
const themeUpdateCallbacks = new Set<() => void>();

function emitThemeUpdate() {
  for (const callback of themeUpdateCallbacks) {
    callback();
  }
}

export function unstableSetRender(
  render?: (node: unknown, container: Element | DocumentFragment) => void,
) {
  renderOverride = render;
}

export function getUnstableRender() {
  return renderOverride;
}

export function setDmPrefixCls(nextPrefixCls: string) {
  prefixCls = nextPrefixCls;
  emitThemeUpdate();
}

export function setDmPrimaryColor(color: string) {
  primaryColor = color;
  emitThemeUpdate();
}

export function onDmThemeUpdate(callback: () => void) {
  themeUpdateCallbacks.add(callback);

  return () => {
    themeUpdateCallbacks.delete(callback);
  };
}

export function getDmTheme() {
  return {
    prefixCls,
    token: {
      colorInfo: primaryColor,
      colorPrimary: primaryColor,
      colorLink: primaryColor,
    },
    components: {
      Table: {
        cellFontSizeSM: 12,
        cellPaddingBlockSM: 10,
        headerColor: "#5a607f",
      },
      Breadcrumb: {
        linkColor: "#5a607f",
        linkHoverColor: "#5a607f",
        itemColor: "#5a607f",
        lastItemColor: "#2f2e3f",
        separatorColor: "#5a607f",
      },
      Menu: {
        collapsedWidth: 60,
        itemMarginBlock: 8,
        itemMarginInline: 10,
        itemPaddingInline: 10,
      },
      Input: {
        activeBorderColor: primaryColor,
      },
      Tabs: {
        inkBarColor: primaryColor,
        itemSelectedColor: primaryColor,
      },
      DatePicker: {
        activeBorderColor: primaryColor,
      },
      Tree: {
        directoryNodeSelectedBg: primaryColor,
      },
      Radio: {
        buttonSolidCheckedBg: primaryColor,
      },
    },
  };
}

export function setDmDatePickerLocale(locale: "zh" | "en") {
  datePickerLocale = locale;
}

export function getDmDatePickerLocale() {
  return datePickerLocale;
}

const pageSizeSuffix = "_pageSize";
const defaultPageSize = 10;

function readPageSize(key: string, fallback: number) {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (raw == null) {
      return fallback;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function usePersistedPageSize(
  persistenceKey?: string,
  initialPageSize = defaultPageSize,
): [number, (size: number) => void] {
  const storageKey = persistenceKey
    ? `${persistenceKey}${pageSizeSuffix}`
    : undefined;
  const [pageSize, setPageSizeState] = useState(() =>
    storageKey ? readPageSize(storageKey, initialPageSize) : initialPageSize,
  );
  const setPageSize = useCallback(
    (nextPageSize: number) => {
      setPageSizeState(nextPageSize);

      if (storageKey) {
        try {
          globalThis.localStorage?.setItem(storageKey, String(nextPageSize));
        } catch {
          // Storage can be unavailable in sandboxed runtimes.
        }
      }
    },
    [storageKey],
  );

  return [pageSize, setPageSize];
}
