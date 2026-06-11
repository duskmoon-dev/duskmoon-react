import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  dmPaginationPagerClass,
  dmPaginationSelectedClass,
  getDmPaginationClasses,
  getDmPaginationRefreshClasses,
} from "../../classes/dm-pagination";
import { Pagination } from "../pagination";
import type {
  DmPaginationLocale,
  DmPaginationProps,
} from "./DmPagination.types";

const defaultLocale: Required<DmPaginationLocale> = {
  refresh: "Refresh",
  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
  showTotalSimple: (total, range) => `${range[0]}-${range[1]} / ${total}`,
  selected: (selectedTotal) => `, ${selectedTotal} selected`,
};

function getResponsiveSimple({
  width,
  total,
  showRefresh,
  showSizeChanger,
}: {
  width: number;
  total: number;
  showRefresh?: boolean;
  showSizeChanger?: boolean;
}) {
  let reservedWidth = 0;

  if (!showRefresh) reservedWidth += 100;
  if (!showSizeChanger) reservedWidth += 100;

  if (width < 900 - reservedWidth) return total >= 100;
  if (width < 1100 - reservedWidth) return total >= 1000;
  if (width < 1220 - reservedWidth) return total >= 99999;
  if (width < 1300 - reservedWidth) return total >= 999999;
  if (width < 1450 - reservedWidth) return total >= 9999999;

  return false;
}

function useElementWidth() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(1000);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(
        entry?.contentRect.width || element.getBoundingClientRect().width,
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

function renderSelected(
  selectedTotal: number,
  locale: Required<DmPaginationLocale>,
) {
  if (!selectedTotal) return null;

  return (
    <span className={dmPaginationSelectedClass}>
      {locale.selected(selectedTotal)}
    </span>
  );
}

export const DmPagination = forwardRef<HTMLDivElement, DmPaginationProps>(
  (
    {
      selectedTotal = 0,
      loading = false,
      total = 0,
      showRefresh = true,
      showPagination = true,
      wrapperStyle,
      className,
      align = "right",
      showTotalFullMessage = false,
      showSizeChanger = true,
      responsiveSimple = true,
      refresh,
      simple,
      showQuickJumper,
      showTotal,
      locale,
      ...props
    },
    ref,
  ) => {
    const [measureRef, width] = useElementWidth();
    const mergedLocale = useMemo(
      () => ({ ...defaultLocale, ...locale }),
      [locale],
    );
    const isRefreshVisible = showRefresh && Boolean(refresh);
    const shouldRender = showPagination || isRefreshVisible;
    const responsiveSimpleMode = responsiveSimple
      ? getResponsiveSimple({
          width,
          total,
          showRefresh,
          showSizeChanger,
        })
      : false;
    const mergedSimple = simple ?? responsiveSimpleMode;
    const mergedShowQuickJumper = showQuickJumper ?? !mergedSimple;

    const totalRenderer = useMemo(() => {
      if (showTotal) return showTotal;

      return (nextTotal: number, range: [number, number]): ReactNode => {
        if (Number(nextTotal) === 0) return "";

        const selected = renderSelected(selectedTotal, mergedLocale);
        const message =
          mergedSimple && !showTotalFullMessage
            ? mergedLocale.showTotalSimple(nextTotal, range, selectedTotal)
            : mergedLocale.showTotal(nextTotal, range, selectedTotal);

        return (
          <span
            title={`${mergedLocale.showTotal(nextTotal, range, selectedTotal)}${
              selectedTotal ? mergedLocale.selected(selectedTotal) : ""
            }`}
          >
            {message}
            {selected}
          </span>
        );
      };
    }, [
      mergedLocale,
      mergedSimple,
      selectedTotal,
      showTotal,
      showTotalFullMessage,
    ]);

    if (!shouldRender) return null;

    return (
      <div
        ref={(element) => {
          measureRef.current = element;

          if (typeof ref === "function") {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        className={getDmPaginationClasses({ align, className })}
        style={wrapperStyle}
      >
        {showPagination ? (
          <div className={dmPaginationPagerClass}>
            <Pagination
              {...props}
              total={total}
              simple={mergedSimple}
              showQuickJumper={mergedShowQuickJumper}
              showSizeChanger={showSizeChanger}
              showTotal={totalRenderer}
            />
          </div>
        ) : null}
        {isRefreshVisible ? (
          <button
            type="button"
            className={getDmPaginationRefreshClasses({ loading })}
            disabled={loading || props.disabled}
            aria-busy={loading || undefined}
            onClick={refresh}
          >
            <span aria-hidden="true">Reload</span>
            <span>{mergedLocale.refresh}</span>
          </button>
        ) : null}
      </div>
    );
  },
);

DmPagination.displayName = "DmPagination";
