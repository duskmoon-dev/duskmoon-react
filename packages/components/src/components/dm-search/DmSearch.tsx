import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  dmSearchActionsClass,
  dmSearchFastFilterClass,
  dmSearchFieldClass,
  dmSearchFieldsClass,
  getDmSearchClasses,
} from "../../classes/dm-search";
import { Button } from "../button";
import { DatePicker } from "../date-picker";
import { Input } from "../input";
import { Select } from "../select";
import type {
  DmSearchItem,
  DmSearchProps,
  DmSearchRef,
} from "./DmSearch.types";

function initialValues(
  items: DmSearchItem[],
  searchParams?: Record<string, unknown>,
  useSearchParams = true,
) {
  return items.reduce<Record<string, unknown>>((acc, item) => {
    const defaultValue =
      item.search.extraProps?.value ?? item.search.formProps?.initialValue;
    acc[item.dataIndex] =
      useSearchParams && searchParams && item.dataIndex in searchParams
        ? searchParams[item.dataIndex]
        : defaultValue;
    return acc;
  }, {});
}

function optionList(extraProps: Record<string, unknown> | undefined) {
  return Array.isArray(extraProps?.options)
    ? (extraProps.options as Array<{
        label?: React.ReactNode;
        value: string | number;
      }>)
    : [];
}

function renderField({
  item,
  value,
  setValue,
  loading,
  enableDefaultPlaceHolder,
}: {
  item: DmSearchItem;
  value: unknown;
  setValue: (value: unknown) => void;
  loading?: boolean;
  enableDefaultPlaceHolder?: boolean;
}) {
  const extraProps = item.search.extraProps ?? {};
  const placeholder =
    extraProps.placeholder ??
    (enableDefaultPlaceHolder
      ? item.search.type === "select"
        ? "Please select"
        : "Please enter"
      : undefined);

  if (item.search.type === "custom") {
    return item.search.render?.(value, setValue, item) ?? null;
  }

  if (item.search.type === "select") {
    return (
      <Select
        {...extraProps}
        disabled={Boolean(loading || extraProps.disabled)}
        value={value as never}
        placeholder={placeholder as React.ReactNode}
        onChange={(nextValue) => setValue(nextValue)}
      />
    );
  }

  if (item.search.type === "dateRange") {
    return (
      <DatePicker.RangePicker
        {...extraProps}
        value={value as never}
        onChange={(nextValue) => setValue(nextValue)}
      />
    );
  }

  if (item.search.type === "date") {
    return (
      <DatePicker
        {...extraProps}
        value={value as never}
        onChange={(nextValue) => setValue(nextValue)}
      />
    );
  }

  if (item.search.type === "radio" || item.search.type === "checkbox") {
    return (
      <div role={item.search.type === "radio" ? "radiogroup" : "group"}>
        {optionList(extraProps).map((option) => (
          <label key={String(option.value)}>
            <input
              type={item.search.type}
              disabled={loading}
              checked={
                item.search.type === "checkbox"
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value
              }
              onChange={(event) => {
                if (item.search.type === "radio") {
                  setValue(option.value);
                  return;
                }

                const current = Array.isArray(value) ? value : [];
                setValue(
                  event.currentTarget.checked
                    ? [...current, option.value]
                    : current.filter((entry) => entry !== option.value),
                );
              }}
            />
            {option.label ?? option.value}
          </label>
        ))}
      </div>
    );
  }

  return (
    <Input
      {...extraProps}
      type={item.search.type === "input-number" ? "number" : "text"}
      disabled={Boolean(loading || extraProps.disabled)}
      placeholder={placeholder as string | undefined}
      value={value == null ? "" : String(value)}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}

export const DmSearch = forwardRef<DmSearchRef, DmSearchProps>(
  (
    {
      items = [],
      onSearch,
      extra,
      fastFilterItem,
      defaultCollapsed = true,
      hideCollapseBtn = false,
      compact = false,
      searchParams,
      loading = false,
      enableDefaultPlaceHolder = false,
      className,
    },
    ref,
  ) => {
    const allItems = useMemo(
      () => (fastFilterItem ? [fastFilterItem, ...items] : items),
      [fastFilterItem, items],
    );
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [values, setValues] = useState(() =>
      initialValues(allItems, searchParams),
    );
    const visibleItems = collapsed ? allItems.slice(0, 1) : allItems;

    useEffect(() => {
      setValues(initialValues(allItems, searchParams));
    }, [allItems, searchParams]);

    function reset(useSearchParams = false) {
      const nextValues = initialValues(allItems, searchParams, useSearchParams);
      setValues(nextValues);
      return nextValues;
    }

    useImperativeHandle(ref, () => ({
      onReset: () => {
        reset(false);
      },
    }));

    return (
      <form
        id="searchForm"
        className={getDmSearchClasses({ compact, collapsed, className })}
        onSubmit={(event) => {
          event.preventDefault();
          onSearch?.(values);
        }}
      >
        {fastFilterItem ? (
          <div className={dmSearchFastFilterClass}>{fastFilterItem.title}</div>
        ) : null}
        <div className={dmSearchFieldsClass}>
          {visibleItems.map((item) => (
            <label key={item.key} className={dmSearchFieldClass}>
              {compact ? null : <span>{item.title}</span>}
              {renderField({
                item,
                value: values[item.dataIndex],
                loading,
                enableDefaultPlaceHolder,
                setValue: (value) =>
                  setValues((current) => ({
                    ...current,
                    [item.dataIndex]: value,
                  })),
              })}
            </label>
          ))}
        </div>
        <div className={dmSearchActionsClass}>
          <Button type="submit" isLoading={loading}>
            Search
          </Button>
          <Button
            type="button"
            color="secondary"
            appearance="outline"
            onClick={() => onSearch?.(reset(false))}
          >
            Reset
          </Button>
          {!hideCollapseBtn && allItems.length > 1 ? (
            <Button
              type="button"
              color="secondary"
              appearance="text"
              onClick={() => {
                setCollapsed((current) => !current);
                setValues(initialValues(allItems, searchParams));
              }}
            >
              {collapsed ? "Expand" : "Collapse"}
            </Button>
          ) : null}
          {extra}
        </div>
      </form>
    );
  },
);

DmSearch.displayName = "DmSearch";
