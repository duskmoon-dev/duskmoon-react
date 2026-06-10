import React, {
  forwardRef,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import {
  getTransferClasses,
  getTransferListClasses,
  getTransferListItemClasses,
  transferListBodyClass,
  transferListEmptyClass,
  transferListHeaderClass,
  transferListItemContentClass,
  transferListItemDescriptionClass,
  transferOperationButtonClass,
  transferOperationClass,
  transferPaginationButtonClass,
  transferPaginationClass,
  transferSearchClass,
} from "../../classes/transfer";
import type {
  TransferComponent,
  TransferDirection,
  TransferItem,
  TransferKey,
  TransferListComponent as TransferListComponentType,
  TransferListProps,
  TransferOperationProps,
  TransferRender,
  TransferRenderResult,
  TransferSearchProps,
  TransferProps,
} from "./Transfer.types";

const defaultLocale = {
  itemUnit: "item",
  itemsUnit: "items",
  notFoundContent: "No data",
  searchPlaceholder: "Search",
};

function uniqueKeys(keys: TransferKey[]) {
  return Array.from(new Set(keys));
}

function getItemKey<T extends TransferItem>(
  item: T,
  rowKey?: (item: T) => TransferKey,
) {
  return rowKey ? rowKey(item) : item.key;
}

function normalizeItems<T extends TransferItem>(
  dataSource: T[],
  rowKey?: (item: T) => TransferKey,
) {
  return dataSource.map((item) => ({
    ...item,
    key: getItemKey(item, rowKey),
  }));
}

function isRenderObject(
  value: TransferRenderResult,
): value is { label: React.ReactNode; value: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "label" in value &&
    "value" in value
  );
}

function renderTransferItem<T extends TransferItem>(
  item: T,
  render?: TransferRender<T>,
) {
  const rendered = render?.(item) ?? item.title ?? item.key;

  if (isRenderObject(rendered)) {
    return {
      label: rendered.label,
      value: rendered.value,
    };
  }

  return {
    label: rendered,
    value:
      typeof rendered === "string"
        ? rendered
        : String(item.title ?? item.description ?? item.key),
  };
}

function defaultFilter<T extends TransferItem>(
  inputValue: string,
  item: T,
  direction: TransferDirection,
  render?: TransferRender<T>,
  filterOption?: TransferListProps<T>["filterOption"],
) {
  if (!inputValue) {
    return true;
  }

  if (filterOption) {
    return filterOption(inputValue, item, direction);
  }

  const rendered = renderTransferItem(item, render);
  const haystack = [
    rendered.value,
    typeof item.title === "string" ? item.title : "",
    typeof item.description === "string" ? item.description : "",
    item.key,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(inputValue.toLowerCase());
}

function getPageSize(pagination?: boolean | { pageSize?: number }) {
  if (!pagination) {
    return 0;
  }

  if (pagination === true) {
    return 10;
  }

  return Math.max(1, Math.floor(pagination.pageSize ?? 10));
}

function getListStyle<T extends TransferItem>(
  listStyle: TransferListProps<T>["listStyle"],
  direction: TransferDirection,
) {
  return typeof listStyle === "function" ? listStyle({ direction }) : listStyle;
}

function getMovableSelectedKeys<T extends TransferItem>(
  items: T[],
  selectedKeys: TransferKey[],
) {
  const movableKeySet = new Set(
    items.filter((item) => !item.disabled).map((item) => item.key),
  );

  return selectedKeys.filter((key) => movableKeySet.has(key));
}

function splitSelectedKeys(
  keys: TransferKey[],
  targetKeySet: Set<TransferKey>,
) {
  return keys.reduce(
    (groups, key) => {
      if (targetKeySet.has(key)) {
        groups.target.push(key);
      } else {
        groups.source.push(key);
      }

      return groups;
    },
    { source: [] as TransferKey[], target: [] as TransferKey[] },
  );
}

export const TransferSearch = forwardRef<HTMLInputElement, TransferSearchProps>(
  ({ className, placeholder = defaultLocale.searchPlaceholder, onChange, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      type="search"
      placeholder={placeholder}
      className={[transferSearchClass, className].filter(Boolean).join(" ")}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.currentTarget.value);
      }}
    />
  ),
);

TransferSearch.displayName = "Transfer.Search";

export const TransferOperation = forwardRef<
  HTMLDivElement,
  TransferOperationProps
>(
  (
    {
      disabled,
      oneWay,
      operations = [">", "<"],
      moveToRightDisabled,
      moveToLeftDisabled,
      onMoveToRight,
      onMoveToLeft,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={[transferOperationClass, className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        className={transferOperationButtonClass}
        disabled={disabled || moveToRightDisabled}
        aria-label="Move selected items to target"
        onClick={onMoveToRight}
      >
        {operations[0] ?? ">"}
      </button>
      {oneWay ? null : (
        <button
          type="button"
          className={transferOperationButtonClass}
          disabled={disabled || moveToLeftDisabled}
          aria-label="Move selected items to source"
          onClick={onMoveToLeft}
        >
          {operations[1] ?? "<"}
        </button>
      )}
    </div>
  ),
);

TransferOperation.displayName = "Transfer.Operation";

function TransferListRoot<T extends TransferItem>(
  {
    direction,
    title,
    items,
    selectedKeys = [],
    disabled,
    showSearch,
    searchValue,
    searchPlaceholder = defaultLocale.searchPlaceholder,
    notFoundContent = defaultLocale.notFoundContent,
    render,
    filterOption,
    pagination,
    listStyle,
    onSearch,
    onItemSelect,
    className,
    ...props
  }: TransferListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const mergedSearchValue = searchValue ?? internalSearchValue;
  const selectedKeySet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        defaultFilter(
          mergedSearchValue,
          item,
          direction,
          render,
          filterOption,
        ),
      ),
    [direction, filterOption, items, mergedSearchValue, render],
  );
  const pageSize = getPageSize(pagination);
  const pageCount = pageSize ? Math.max(1, Math.ceil(filteredItems.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const visibleItems = pageSize
    ? filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredItems;

  function handleSearch(value: string) {
    setInternalSearchValue(value);
    setPage(1);
    onSearch?.(direction, value);
  }

  function toggleItem(item: T) {
    if (disabled || item.disabled) {
      return;
    }

    onItemSelect?.(item.key, !selectedKeySet.has(item.key));
  }

  return (
    <div
      {...props}
      ref={ref}
      className={getTransferListClasses({ direction, className })}
      style={getListStyle(listStyle, direction)}
    >
      <div className={transferListHeaderClass}>
        <span>{title}</span>
        <span>
          {selectedKeys.length} / {items.length}
        </span>
      </div>
      {showSearch ? (
        <TransferSearch
          value={mergedSearchValue}
          disabled={disabled}
          placeholder={searchPlaceholder}
          aria-label={`Search ${direction} list`}
          onChange={handleSearch}
        />
      ) : null}
      <div className={transferListBodyClass} role="listbox">
        {visibleItems.length === 0 ? (
          <div className={transferListEmptyClass}>{notFoundContent}</div>
        ) : (
          visibleItems.map((item) => {
            const rendered = renderTransferItem(item, render);
            const selected = selectedKeySet.has(item.key);

            return (
              <label
                key={item.key}
                className={getTransferListItemClasses({
                  selected,
                  disabled: disabled || item.disabled,
                })}
              >
                <input
                  type="checkbox"
                  aria-label={rendered.value}
                  checked={selected}
                  disabled={disabled || item.disabled}
                  onChange={() => toggleItem(item)}
                />
                <span className={transferListItemContentClass}>
                  {rendered.label}
                  {item.description ? (
                    <span className={transferListItemDescriptionClass}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })
        )}
      </div>
      {pageSize && pageCount > 1 ? (
        <div className={transferPaginationClass}>
          <button
            type="button"
            className={transferPaginationButtonClass}
            disabled={disabled || currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Prev
          </button>
          <span>
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            className={transferPaginationButtonClass}
            disabled={disabled || currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

const TransferList = forwardRef(TransferListRoot) as <
  T extends TransferItem = TransferItem,
>(
  props: TransferListProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
const TransferListComponent = TransferList as TransferListComponentType & {
  displayName?: string;
};

function TransferRoot<T extends TransferItem>(
  {
    dataSource = [],
    targetKeys,
    defaultTargetKeys = [],
    selectedKeys,
    defaultSelectedKeys = [],
    render,
    showSearch,
    filterOption,
    pagination,
    oneWay,
    operations,
    titles = ["Source", "Target"],
    disabled,
    listStyle,
    rowKey,
    locale,
    onChange,
    onSelectChange,
    onSearch,
    className,
    ...props
  }: TransferProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const mergedLocale = { ...defaultLocale, ...locale };
  const [internalTargetKeys, setInternalTargetKeys] =
    useState(defaultTargetKeys);
  const [internalSelectedKeys, setInternalSelectedKeys] =
    useState(defaultSelectedKeys);
  const mergedTargetKeys = targetKeys ?? internalTargetKeys;
  const mergedSelectedKeys = selectedKeys ?? internalSelectedKeys;
  const normalizedItems = useMemo(
    () => normalizeItems(dataSource, rowKey),
    [dataSource, rowKey],
  );
  const targetKeySet = useMemo(
    () => new Set(mergedTargetKeys),
    [mergedTargetKeys],
  );
  const sourceItems = normalizedItems.filter((item) => !targetKeySet.has(item.key));
  const targetItems = normalizedItems.filter((item) => targetKeySet.has(item.key));
  const selectedGroups = splitSelectedKeys(mergedSelectedKeys, targetKeySet);
  const movableSourceKeys = getMovableSelectedKeys(
    sourceItems,
    selectedGroups.source,
  );
  const movableTargetKeys = getMovableSelectedKeys(
    targetItems,
    selectedGroups.target,
  );

  function updateSelectedKeys(nextSelectedKeys: TransferKey[]) {
    const nextGroups = splitSelectedKeys(nextSelectedKeys, targetKeySet);

    if (selectedKeys === undefined) {
      setInternalSelectedKeys(nextSelectedKeys);
    }

    onSelectChange?.(nextGroups.source, nextGroups.target);
  }

  function handleItemSelect(key: TransferKey, selected: boolean) {
    const nextSelectedKeys = selected
      ? uniqueKeys([...mergedSelectedKeys, key])
      : mergedSelectedKeys.filter((selectedKey) => selectedKey !== key);

    updateSelectedKeys(nextSelectedKeys);
  }

  function move(direction: TransferDirection) {
    if (direction === "left" && oneWay) {
      return;
    }

    const moveKeys =
      direction === "right"
        ? movableSourceKeys
        : movableTargetKeys;

    if (moveKeys.length === 0) {
      return;
    }

    const nextTargetKeys =
      direction === "right"
        ? uniqueKeys([...mergedTargetKeys, ...moveKeys])
        : mergedTargetKeys.filter((key) => !moveKeys.includes(key));
    const nextSelectedKeys = mergedSelectedKeys.filter(
      (key) => !moveKeys.includes(key),
    );

    if (targetKeys === undefined) {
      setInternalTargetKeys(nextTargetKeys);
    }

    if (selectedKeys === undefined) {
      setInternalSelectedKeys(nextSelectedKeys);
    }

    onChange?.(nextTargetKeys, direction, moveKeys);

    const nextTargetKeySet = new Set(nextTargetKeys);
    const nextGroups = splitSelectedKeys(nextSelectedKeys, nextTargetKeySet);
    onSelectChange?.(nextGroups.source, nextGroups.target);
  }

  return (
    <div
      {...props}
      ref={ref}
      className={getTransferClasses({ disabled, oneWay, className })}
    >
      <TransferListComponent
        direction="left"
        title={titles[0]}
        items={sourceItems}
        selectedKeys={selectedGroups.source}
        disabled={disabled}
        showSearch={showSearch}
        searchPlaceholder={mergedLocale.searchPlaceholder}
        notFoundContent={mergedLocale.notFoundContent}
        render={render}
        filterOption={filterOption}
        pagination={pagination}
        listStyle={listStyle}
        onSearch={onSearch}
        onItemSelect={handleItemSelect}
      />
      <TransferOperation
        disabled={disabled}
        oneWay={oneWay}
        operations={operations}
        moveToRightDisabled={movableSourceKeys.length === 0}
        moveToLeftDisabled={movableTargetKeys.length === 0}
        onMoveToRight={() => move("right")}
        onMoveToLeft={() => move("left")}
      />
      <TransferListComponent
        direction="right"
        title={titles[1]}
        items={targetItems}
        selectedKeys={selectedGroups.target}
        disabled={disabled || oneWay}
        showSearch={showSearch}
        searchPlaceholder={mergedLocale.searchPlaceholder}
        notFoundContent={mergedLocale.notFoundContent}
        render={render}
        filterOption={filterOption}
        pagination={pagination}
        listStyle={listStyle}
        onSearch={onSearch}
        onItemSelect={handleItemSelect}
      />
    </div>
  );
}

const TransferRootWithRef = forwardRef(TransferRoot) as unknown as <
  T extends TransferItem = TransferItem,
>(
  props: TransferProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;

TransferListComponent.displayName = "Transfer.List";

export const Transfer = Object.assign(TransferRootWithRef, {
  Search: TransferSearch,
  Operation: TransferOperation,
  List: TransferListComponent,
}) as TransferComponent;

Transfer.displayName = "Transfer";
