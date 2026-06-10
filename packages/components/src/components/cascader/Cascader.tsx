import React, { forwardRef, useMemo, useState } from "react";
import {
  cascaderClearClass,
  cascaderDropdownClass,
  cascaderEmptyClass,
  cascaderIconClass,
  cascaderMenuClass,
  cascaderMenusClass,
  cascaderPlaceholderClass,
  cascaderSearchClass,
  cascaderSelectionClass,
  cascaderTagClass,
  getCascaderClasses,
  getCascaderContainerClasses,
  getCascaderOptionClasses,
} from "../../classes/cascader";
import type {
  CascaderChangeValue,
  CascaderComponent,
  CascaderFieldNames,
  CascaderMultipleValue,
  CascaderOption,
  CascaderPanelProps,
  CascaderProps,
  CascaderSingleValue,
  CascaderValue,
} from "./Cascader.types";

const defaultFieldNames: Required<CascaderFieldNames> = {
  label: "label",
  value: "value",
  children: "children",
};

function normalizeFieldNames(fieldNames?: CascaderFieldNames) {
  return { ...defaultFieldNames, ...fieldNames };
}

function getOptionValue(option: CascaderOption, names: Required<CascaderFieldNames>) {
  return option[names.value] as CascaderValue | undefined;
}

function getOptionLabel(option: CascaderOption, names: Required<CascaderFieldNames>) {
  return (option[names.label] ?? getOptionValue(option, names)) as React.ReactNode;
}

function getOptionChildren(option: CascaderOption, names: Required<CascaderFieldNames>) {
  const children = option[names.children];
  return Array.isArray(children) ? (children as CascaderOption[]) : undefined;
}

function valueKey(value: CascaderSingleValue) {
  return value.map(String).join("__dm_cascader__");
}

function isMultipleValue(value: CascaderChangeValue | undefined): value is CascaderMultipleValue {
  return Array.isArray(value) && Array.isArray(value[0]);
}

function normalizeSingleValue(value: CascaderChangeValue | undefined): CascaderSingleValue {
  if (!Array.isArray(value) || isMultipleValue(value)) {
    return [];
  }

  return value.filter(
    (item): item is CascaderValue =>
      typeof item === "string" || typeof item === "number",
  );
}

function normalizeMultipleValue(value: CascaderChangeValue | undefined): CascaderMultipleValue {
  if (!Array.isArray(value)) {
    return [];
  }

  if (isMultipleValue(value)) {
    return value.map(normalizeSingleValue);
  }

  const single = normalizeSingleValue(value);
  return single.length > 0 ? [single] : [];
}

function findPath(
  options: CascaderOption[],
  value: CascaderSingleValue,
  names: Required<CascaderFieldNames>,
) {
  const path: CascaderOption[] = [];
  let levelOptions = options;

  for (const item of value) {
    const next = levelOptions.find((option) => getOptionValue(option, names) === item);

    if (!next) {
      return [];
    }

    path.push(next);
    levelOptions = getOptionChildren(next, names) ?? [];
  }

  return path;
}

function flattenLeafPaths(
  options: CascaderOption[],
  names: Required<CascaderFieldNames>,
  parents: CascaderOption[] = [],
): CascaderOption[][] {
  return options.flatMap((option): CascaderOption[][] => {
    const path = [...parents, option];
    const children = getOptionChildren(option, names);

    if (children?.length) {
      return flattenLeafPaths(children, names, path);
    }

    return [path];
  });
}

function labelsForPath(path: CascaderOption[], names: Required<CascaderFieldNames>) {
  return path.map((option) => getOptionLabel(option, names));
}

function valuesForPath(path: CascaderOption[], names: Required<CascaderFieldNames>) {
  return path
    .map((option) => getOptionValue(option, names))
    .filter(
      (value): value is CascaderValue =>
        typeof value === "string" || typeof value === "number",
    );
}

function defaultDisplay(labels: React.ReactNode[]) {
  return labels.map((label, index) => (
    <React.Fragment key={index}>
      {index > 0 ? " / " : null}
      {label}
    </React.Fragment>
  ));
}

function defaultFilter(
  inputValue: string,
  path: CascaderOption[],
  names: Required<CascaderFieldNames>,
) {
  return labelsForPath(path, names)
    .map((label) => String(label ?? ""))
    .join(" / ")
    .toLowerCase()
    .includes(inputValue.toLowerCase());
}

interface CascaderMenusProps {
  activeValue: CascaderSingleValue;
  changeOnSelect?: boolean;
  disabled?: boolean;
  expandTrigger?: CascaderProps["expandTrigger"];
  loadData?: (selectedOptions: CascaderOption[]) => void;
  multiple?: boolean;
  names: Required<CascaderFieldNames>;
  onActiveChange: (value: CascaderSingleValue) => void;
  onPick: (path: CascaderOption[], complete: boolean) => void;
  options: CascaderOption[];
  selectedKeys: Set<string>;
}

function CascaderMenus({
  activeValue,
  changeOnSelect,
  disabled,
  expandTrigger = "click",
  loadData,
  multiple,
  names,
  onActiveChange,
  onPick,
  options,
  selectedKeys,
}: CascaderMenusProps) {
  const columns: CascaderOption[][] = [];
  let levelOptions = options;

  columns.push(levelOptions);

  for (const activeItem of activeValue) {
    const option = levelOptions.find(
      (candidate) => getOptionValue(candidate, names) === activeItem,
    );
    const children = option ? getOptionChildren(option, names) : undefined;

    if (!children?.length) {
      break;
    }

    columns.push(children);
    levelOptions = children;
  }

  if (columns[0].length === 0) {
    return <div className={cascaderEmptyClass}>No data</div>;
  }

  return (
    <div className={cascaderMenusClass}>
      {columns.map((column, columnIndex) => {
        const parentValue = activeValue.slice(0, columnIndex);

        return (
          <div className={cascaderMenuClass} role="menu" key={columnIndex}>
            {column.map((option) => {
              const optionValue = getOptionValue(option, names);
              const optionChildren = getOptionChildren(option, names);
              const nextValue =
                optionValue === undefined ? parentValue : [...parentValue, optionValue];
              const path = findPath(options, nextValue, names);
              const hasChildren = Boolean(optionChildren?.length);
              const canLoad = Boolean(loadData && option.isLeaf === false && !hasChildren);
              const selectable = !hasChildren || changeOnSelect || multiple;
              const selected = selectedKeys.has(valueKey(nextValue));
              const active = activeValue[columnIndex] === optionValue;

              return (
                <button
                  key={String(optionValue ?? getOptionLabel(option, names))}
                  type="button"
                  role="menuitem"
                  disabled={disabled || option.disabled}
                  className={getCascaderOptionClasses({
                    active,
                    selected,
                    disabled: disabled || option.disabled,
                    loading: option.loading,
                    expand: hasChildren || canLoad,
                    className: option.className,
                  })}
                  onMouseEnter={() => {
                    if (!disabled && !option.disabled && expandTrigger === "hover") {
                      onActiveChange(nextValue);
                    }
                  }}
                  onClick={() => {
                    if (disabled || option.disabled) {
                      return;
                    }

                    onActiveChange(nextValue);

                    if (canLoad) {
                      loadData?.(path);
                    }

                    if (selectable) {
                      onPick(path, !hasChildren && !canLoad);
                    }
                  }}
                >
                  <span>{getOptionLabel(option, names)}</span>
                  {option.loading ? <span aria-hidden="true">...</span> : null}
                  {hasChildren || canLoad ? <span aria-hidden="true">›</span> : null}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const CascaderPanel = forwardRef<HTMLDivElement, CascaderPanelProps>(
  ({ className, options = [], fieldNames, value, defaultValue, onChange, onSelect, ...props }, ref) => {
    const names = useMemo(() => normalizeFieldNames(fieldNames), [fieldNames]);
    const [activeValue, setActiveValue] = useState<CascaderSingleValue>(
      normalizeSingleValue(value ?? defaultValue),
    );
    const [internalValue, setInternalValue] = useState<CascaderChangeValue | undefined>(
      defaultValue,
    );
    const currentValue = value ?? internalValue;
    const selectedValues = normalizeMultipleValue(currentValue);
    const selectedKeys = new Set(selectedValues.map(valueKey));

    function pick(path: CascaderOption[]) {
      const nextValue = valuesForPath(path, names);

      setInternalValue(nextValue);
      onSelect?.(nextValue, path);
      onChange?.(nextValue, path);
    }

    return (
      <div {...props} ref={ref} className={className}>
        <CascaderMenus
          activeValue={activeValue}
          names={names}
          onActiveChange={setActiveValue}
          onPick={(path) => pick(path)}
          options={options}
          selectedKeys={selectedKeys}
        />
      </div>
    );
  },
);

CascaderPanel.displayName = "Cascader.Panel";

const CascaderRoot = forwardRef<HTMLDivElement, CascaderProps>(
  (
    {
      allowClear,
      changeOnSelect,
      className,
      defaultOpen,
      defaultValue,
      disabled,
      displayRender,
      expandTrigger = "click",
      fieldNames,
      loadData,
      multiple,
      notFoundContent = "No data",
      onChange,
      onDropdownVisibleChange,
      onOpenChange,
      onSearch,
      onSelect,
      open,
      options = [],
      placeholder = "Please select",
      showSearch,
      size = "middle",
      status,
      value,
      ...props
    },
    ref,
  ) => {
    const names = useMemo(() => normalizeFieldNames(fieldNames), [fieldNames]);
    const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
    const [internalValue, setInternalValue] = useState<CascaderChangeValue | undefined>(
      defaultValue,
    );
    const [activeValue, setActiveValue] = useState<CascaderSingleValue>(
      normalizeSingleValue(value ?? defaultValue),
    );
    const [searchValue, setSearchValue] = useState("");
    const controlledOpen = open !== undefined;
    const visible = controlledOpen ? open : internalOpen;
    const controlledValue = value !== undefined;
    const currentValue = controlledValue ? value : internalValue;
    const selectedValues = multiple
      ? normalizeMultipleValue(currentValue)
      : normalizeSingleValue(currentValue).length > 0
        ? [normalizeSingleValue(currentValue)]
        : [];
    const selectedKeys = new Set(selectedValues.map(valueKey));
    const selectedPaths = selectedValues.map((item) => findPath(options, item, names));
    const hasValue = selectedValues.length > 0;
    const searchable = Boolean(showSearch);
    const flattenedPaths = useMemo(
      () => flattenLeafPaths(options, names),
      [names, options],
    );
    const filteredPaths = searchable && searchValue
      ? flattenedPaths
          .filter((path: CascaderOption[]) => {
            if (typeof showSearch === "object" && showSearch.filter) {
              return showSearch.filter(searchValue, path, names);
            }

            return defaultFilter(searchValue, path, names);
          })
          .slice(
            0,
            typeof showSearch === "object" && typeof showSearch.limit === "number"
              ? showSearch.limit
              : undefined,
          )
      : [];

    function setVisible(nextOpen: boolean) {
      if (disabled) {
        return;
      }

      if (!controlledOpen) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
      onDropdownVisibleChange?.(nextOpen);
    }

    function emitChange(nextValue: CascaderChangeValue, selectedOptions: CascaderOption[] | CascaderOption[][]) {
      if (!controlledValue) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, selectedOptions);
    }

    function pickPath(path: CascaderOption[], complete: boolean) {
      const nextValue = valuesForPath(path, names);

      onSelect?.(nextValue, path);

      if (multiple) {
        const currentValues = normalizeMultipleValue(currentValue);
        const nextKey = valueKey(nextValue);
        const selected = currentValues.some((item) => valueKey(item) === nextKey);
        const nextValues = selected
          ? currentValues.filter((item) => valueKey(item) !== nextKey)
          : [...currentValues, nextValue];
        const nextPaths = nextValues.map((item) => findPath(options, item, names));

        emitChange(nextValues, nextPaths);
        return;
      }

      if (complete || changeOnSelect) {
        emitChange(nextValue, path);

        if (complete) {
          setVisible(false);
        }
      }
    }

    function clearValue(event: React.MouseEvent<HTMLSpanElement>) {
      event.stopPropagation();

      if (disabled) {
        return;
      }

      const emptyValue = multiple ? [] : [];

      if (!controlledValue) {
        setInternalValue(emptyValue);
      }

      setActiveValue([]);
      onChange?.(emptyValue, multiple ? [] : []);
    }

    function renderSelection() {
      if (!hasValue) {
        return <span className={cascaderPlaceholderClass}>{placeholder}</span>;
      }

      if (multiple) {
        return selectedPaths.map((path, index) => (
          <span key={valueKey(selectedValues[index] ?? [])} className={cascaderTagClass}>
            {displayRender
              ? displayRender(labelsForPath(path, names), path)
              : defaultDisplay(labelsForPath(path, names))}
          </span>
        ));
      }

      const path = selectedPaths[0] ?? [];
      const labels = labelsForPath(path, names);

      return displayRender ? displayRender(labels, path) : defaultDisplay(labels);
    }

    const searchResults = filteredPaths.length > 0 ? (
      <div className={cascaderMenuClass} role="menu">
        {filteredPaths.map((path: CascaderOption[]) => {
          const pathValue = valuesForPath(path, names);
          const label =
            typeof showSearch === "object" && showSearch.render
              ? showSearch.render(searchValue, path, names)
              : defaultDisplay(labelsForPath(path, names));

          return (
            <button
              key={valueKey(pathValue)}
              type="button"
              role="menuitem"
              className={getCascaderOptionClasses({
                selected: selectedKeys.has(valueKey(pathValue)),
              })}
              onClick={() => {
                setActiveValue(pathValue);
                pickPath(path, true);
                setSearchValue("");
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    ) : (
      <div className={cascaderEmptyClass}>{notFoundContent}</div>
    );

    return (
      <div
        {...props}
        ref={ref}
        className={getCascaderContainerClasses({
          open: visible,
          disabled,
          className,
        })}
      >
        <button
          type="button"
          className={getCascaderClasses({ size, status, disabled })}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={visible}
          onClick={() => setVisible(!visible)}
        >
          <span className={cascaderSelectionClass}>{renderSelection()}</span>
          {allowClear && hasValue && !disabled ? (
            <span
              className={cascaderClearClass}
              aria-label="Clear selection"
              role="button"
              tabIndex={0}
              onClick={clearValue}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.stopPropagation();
                  clearValue(event as unknown as React.MouseEvent<HTMLSpanElement>);
                }
              }}
            >
              x
            </span>
          ) : null}
          <span className={cascaderIconClass} aria-hidden="true">
            v
          </span>
        </button>
        {visible ? (
          <div className={cascaderDropdownClass}>
            {searchable ? (
              <input
                className={cascaderSearchClass}
                placeholder={typeof placeholder === "string" ? placeholder : undefined}
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.currentTarget.value);
                  onSearch?.(event.currentTarget.value);
                }}
              />
            ) : null}
            {searchable && searchValue ? (
              searchResults
            ) : (
              <CascaderMenus
                activeValue={activeValue}
                changeOnSelect={changeOnSelect}
                disabled={disabled}
                expandTrigger={expandTrigger}
                loadData={loadData}
                multiple={multiple}
                names={names}
                onActiveChange={setActiveValue}
                onPick={pickPath}
                options={options}
                selectedKeys={selectedKeys}
              />
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

CascaderRoot.displayName = "Cascader";

export const Cascader = Object.assign(CascaderRoot, {
  Panel: CascaderPanel,
  SHOW_PARENT: "SHOW_PARENT" as const,
  SHOW_CHILD: "SHOW_CHILD" as const,
}) as CascaderComponent;
