import React, {
  forwardRef,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  getPaginationClasses,
  getPaginationItemClasses,
  paginationEllipsisClass,
  paginationInfoClass,
  paginationInfoTextClass,
  paginationInputClass,
  paginationNextClass,
  paginationPrevClass,
} from "../../classes/pagination";
import type { PaginationProps } from "./Pagination.types";

type PageToken = number | "ellipsis";

const defaultPageSizeOptions = [10, 20, 50, 100];

function toPositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || value === undefined) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function clampPage(page: number, pageCount: number) {
  return Math.min(pageCount, Math.max(1, Math.floor(page)));
}

function getPageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

function getRange(current: number, pageSize: number, total: number) {
  if (total <= 0) {
    return [0, 0] as [number, number];
  }

  const start = (current - 1) * pageSize + 1;
  const end = Math.min(total, current * pageSize);

  return [start, end] as [number, number];
}

function getPageTokens(current: number, pageCount: number): PageToken[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set([1, pageCount, current - 1, current, current + 1]);

  if (current <= 4) {
    [2, 3, 4, 5].forEach((page) => pages.add(page));
  }

  if (current >= pageCount - 3) {
    [pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1].forEach(
      (page) => pages.add(page),
    );
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((first, second) => first - second);

  return sortedPages.reduce<PageToken[]>((tokens, page) => {
    const previous = tokens[tokens.length - 1];

    if (typeof previous === "number") {
      const gap = page - previous;

      if (gap === 2) {
        tokens.push(previous + 1);
      } else if (gap > 2) {
        tokens.push("ellipsis");
      }
    }

    tokens.push(page);
    return tokens;
  }, []);
}

function getSizeOptions(pageSize: number) {
  return Array.from(new Set([...defaultPageSizeOptions, pageSize])).sort(
    (first, second) => first - second,
  );
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      current,
      defaultCurrent = 1,
      pageSize,
      defaultPageSize = 10,
      total = 0,
      onChange,
      disabled,
      simple,
      showSizeChanger,
      showQuickJumper,
      showTotal,
      size = "md",
      className,
      ...props
    },
    ref,
  ) => {
    const isCurrentControlled = current !== undefined;
    const isPageSizeControlled = pageSize !== undefined;
    const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
    const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
    const [quickJumpValue, setQuickJumpValue] = useState("");

    const mergedPageSize = toPositiveInteger(
      pageSize ?? internalPageSize,
      defaultPageSize,
    );
    const pageCount = getPageCount(total, mergedPageSize);
    const mergedCurrent = clampPage(
      toPositiveInteger(current ?? internalCurrent, defaultCurrent),
      pageCount,
    );
    const pageTokens = useMemo(
      () => getPageTokens(mergedCurrent, pageCount),
      [mergedCurrent, pageCount],
    );
    const range = getRange(mergedCurrent, mergedPageSize, total);

    function changePage(nextPage: number, nextPageSize = mergedPageSize) {
      const nextPageCount = getPageCount(total, nextPageSize);
      const normalizedPage = clampPage(nextPage, nextPageCount);

      if (!isCurrentControlled) {
        setInternalCurrent(normalizedPage);
      }

      if (!isPageSizeControlled) {
        setInternalPageSize(nextPageSize);
      }

      onChange?.(normalizedPage, nextPageSize);
    }

    function handlePageSizeChange(event: ChangeEvent<HTMLSelectElement>) {
      const nextPageSize = toPositiveInteger(
        Number(event.currentTarget.value),
        mergedPageSize,
      );
      const nextPage = clampPage(
        mergedCurrent,
        getPageCount(total, nextPageSize),
      );

      changePage(nextPage, nextPageSize);
    }

    function jumpToInputPage(value: string) {
      const nextPage = Number(value);

      if (!Number.isFinite(nextPage)) {
        return;
      }

      changePage(nextPage);
      setQuickJumpValue("");
    }

    function handleQuickJumpKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (event.key !== "Enter") {
        return;
      }

      jumpToInputPage(event.currentTarget.value);
    }

    const previousDisabled = disabled || mergedCurrent <= 1;
    const nextDisabled = disabled || mergedCurrent >= pageCount;

    return (
      <nav
        {...props}
        ref={ref}
        className={getPaginationClasses({ size, compact: simple, className })}
      >
        {showTotal ? (
          <div className={paginationInfoClass}>
            <span className={paginationInfoTextClass}>
              {showTotal(total, range)}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          className={paginationPrevClass}
          disabled={previousDisabled}
          aria-label="Previous page"
          onClick={() => changePage(mergedCurrent - 1)}
        >
          Prev
        </button>

        {simple ? (
          <div className={paginationInputClass}>
            <input
              aria-label="Current page"
              type="number"
              min={1}
              max={pageCount}
              value={quickJumpValue || String(mergedCurrent)}
              disabled={disabled}
              onChange={(event) => setQuickJumpValue(event.currentTarget.value)}
              onKeyDown={handleQuickJumpKeyDown}
              onBlur={(event) => {
                if (event.currentTarget.value !== String(mergedCurrent)) {
                  jumpToInputPage(event.currentTarget.value);
                }
              }}
            />
            <span className={paginationInfoTextClass}>/ {pageCount}</span>
          </div>
        ) : (
          pageTokens.map((pageToken, index) =>
            pageToken === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                aria-hidden="true"
                className={paginationEllipsisClass}
              />
            ) : (
              <button
                key={pageToken}
                type="button"
                className={getPaginationItemClasses({
                  active: pageToken === mergedCurrent,
                  disabled,
                })}
                disabled={disabled}
                aria-current={pageToken === mergedCurrent ? "page" : undefined}
                aria-label={`Page ${pageToken}`}
                onClick={() => changePage(pageToken)}
              >
                {pageToken}
              </button>
            ),
          )
        )}

        <button
          type="button"
          className={paginationNextClass}
          disabled={nextDisabled}
          aria-label="Next page"
          onClick={() => changePage(mergedCurrent + 1)}
        >
          Next
        </button>

        {showSizeChanger ? (
          <div className={paginationInputClass}>
            <select
              aria-label="Page size"
              value={mergedPageSize}
              disabled={disabled}
              onChange={handlePageSizeChange}
            >
              {getSizeOptions(mergedPageSize).map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {showQuickJumper && !simple ? (
          <div className={paginationInputClass}>
            <input
              aria-label="Jump to page"
              type="number"
              min={1}
              max={pageCount}
              value={quickJumpValue}
              disabled={disabled}
              onChange={(event) => setQuickJumpValue(event.currentTarget.value)}
              onKeyDown={handleQuickJumpKeyDown}
            />
          </div>
        ) : null}
      </nav>
    );
  },
);

Pagination.displayName = "Pagination";
