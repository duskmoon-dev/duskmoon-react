import React, { forwardRef, useMemo, useState } from "react";
import {
  getSelectClasses,
  getSelectContainerClasses,
  getSelectOptionClasses,
  selectClearClass,
  selectDropdownClass,
  selectEmptyClass,
  selectGroupClass,
  selectGroupLabelClass,
  selectIconClass,
  selectPlaceholderClass,
  selectSearchClass,
  selectSelectionClass,
  selectTagClass,
} from "../../classes/select";
import { cn } from "../../utils";
import type {
  SelectComponent,
  SelectOptGroupProps,
  SelectOptGroupType,
  SelectOptionInput,
  SelectOptionProps,
  SelectOptionType,
  SelectProps,
  SelectValue,
} from "./Select.types";

function isGroup(option: SelectOptionInput): option is SelectOptGroupType {
  return "options" in option;
}

function optionLabel(option: SelectOptionType) {
  return option.label ?? option.value;
}

function valueKey(value: SelectValue) {
  return String(value);
}

function normalizeSingleValue(value: unknown): SelectValue | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function normalizeMultiValue(value: unknown): SelectValue[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is SelectValue =>
        typeof item === "string" || typeof item === "number",
    );
  }

  const single = normalizeSingleValue(value);
  return single === undefined ? [] : [single];
}

function optionsFromChildren(children: React.ReactNode): SelectOptionInput[] {
  const result: SelectOptionInput[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      return;
    }

    if (child.type === Option) {
      const props = child.props as SelectOptionProps;
      result.push({
        value: props.value,
        label: props.children,
        disabled: props.disabled,
        className: props.className,
      });
      return;
    }

    if (child.type === OptGroup) {
      const props = child.props as SelectOptGroupProps;
      result.push({
        label: props.label,
        className: props.className,
        options: optionsFromChildren(props.children).filter(
          (option): option is SelectOptionType => !isGroup(option),
        ),
      });
    }
  });

  return result;
}

function flattenOptions(options: SelectOptionInput[]) {
  return options.flatMap((option) =>
    isGroup(option) ? option.options : option,
  );
}

function matchesOption(
  option: SelectOptionType,
  searchValue: string,
  filterOption: SelectProps["filterOption"],
) {
  if (!searchValue || filterOption === false) {
    return true;
  }

  if (typeof filterOption === "function") {
    return filterOption(searchValue, option);
  }

  const label = optionLabel(option);
  const text =
    typeof label === "string" || typeof label === "number"
      ? String(label)
      : String(option.value);

  return text.toLowerCase().includes(searchValue.toLowerCase());
}

function filterOptions(
  options: SelectOptionInput[],
  searchValue: string,
  filterOption: SelectProps["filterOption"],
) {
  return options
    .map((option) => {
      if (!isGroup(option)) {
        return matchesOption(option, searchValue, filterOption) ? option : null;
      }

      const groupOptions = option.options.filter((child) =>
        matchesOption(child, searchValue, filterOption),
      );

      return groupOptions.length > 0
        ? { ...option, options: groupOptions }
        : null;
    })
    .filter((option): option is SelectOptionInput => option !== null);
}

function renderValue(option?: SelectOptionType) {
  return option ? optionLabel(option) : null;
}

const Option = forwardRef<HTMLDivElement, SelectOptionProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ),
);

Option.displayName = "Select.Option";

const OptGroup = forwardRef<HTMLDivElement, SelectOptGroupProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ),
);

OptGroup.displayName = "Select.OptGroup";

const SelectRoot = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      allowClear,
      children,
      className,
      defaultValue,
      disabled,
      filterOption,
      loading,
      mode,
      onChange,
      options,
      placeholder,
      showSearch,
      size = "md",
      status,
      value,
      ...props
    },
    ref,
  ) => {
    const multiple = mode === "multiple" || mode === "tags";
    const sourceOptions = useMemo(
      () => options ?? optionsFromChildren(children),
      [children, options],
    );
    const flatOptions = useMemo(
      () => flattenOptions(sourceOptions),
      [sourceOptions],
    );
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [internalValue, setInternalValue] = useState<
      SelectValue | SelectValue[] | undefined
    >(
      multiple
        ? normalizeMultiValue(defaultValue)
        : normalizeSingleValue(defaultValue),
    );
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;
    const selectedValues = multiple
      ? normalizeMultiValue(currentValue)
      : normalizeSingleValue(currentValue) === undefined
        ? []
        : [normalizeSingleValue(currentValue) as SelectValue];
    const selectedKeys = new Set(selectedValues.map(valueKey));
    const selectedOptions = selectedValues.map(
      (selectedValue) =>
        flatOptions.find((option) => option.value === selectedValue) ?? {
          value: selectedValue,
          label: selectedValue,
        },
    );
    const visibleOptions = filterOptions(
      sourceOptions,
      searchValue,
      filterOption,
    );
    const hasValue = selectedValues.length > 0;
    const searchable = showSearch || mode === "tags";

    function emitChange(nextValue: SelectValue | SelectValue[] | undefined) {
      if (!controlled) {
        setInternalValue(nextValue);
      }

      const nextValues = Array.isArray(nextValue)
        ? nextValue
        : nextValue === undefined
          ? []
          : [nextValue];
      const nextOptions = nextValues.map(
        (next) =>
          flatOptions.find((option) => option.value === next) ?? {
            value: next,
            label: next,
          },
      );

      onChange?.(nextValue, multiple ? nextOptions : nextOptions[0]);
    }

    function selectOption(option: SelectOptionType) {
      if (disabled || loading || option.disabled) {
        return;
      }

      if (multiple) {
        const optionKey = valueKey(option.value);
        const nextValues = selectedKeys.has(optionKey)
          ? selectedValues.filter((item) => valueKey(item) !== optionKey)
          : [...selectedValues, option.value];

        emitChange(nextValues);
      } else {
        emitChange(option.value);
        setOpen(false);
      }

      setSearchValue("");
    }

    function clearValue(event: React.MouseEvent<HTMLSpanElement>) {
      event.stopPropagation();

      if (disabled || loading) {
        return;
      }

      emitChange(multiple ? [] : undefined);
      setSearchValue("");
    }

    function addTag() {
      const tag = searchValue.trim();

      if (mode !== "tags" || tag.length === 0) {
        return;
      }

      if (!selectedKeys.has(tag)) {
        emitChange([...selectedValues, tag]);
      }

      setSearchValue("");
    }

    function renderOption(option: SelectOptionType) {
      const selected = selectedKeys.has(valueKey(option.value));

      return (
        <button
          key={valueKey(option.value)}
          type="button"
          role="option"
          aria-selected={selected}
          disabled={disabled || option.disabled}
          className={getSelectOptionClasses({
            selected,
            disabled: disabled || option.disabled,
            className: option.className,
          })}
          onClick={() => selectOption(option)}
        >
          {optionLabel(option)}
        </button>
      );
    }

    function renderOptions(optionItems: SelectOptionInput[]) {
      return optionItems.map((option, index) => {
        if (!isGroup(option)) {
          return renderOption(option);
        }

        return (
          <div
            key={`group-${index}`}
            className={cn(selectGroupClass, option.className)}
            role="group"
          >
            <div className={selectGroupLabelClass}>{option.label}</div>
            {option.options.map(renderOption)}
          </div>
        );
      });
    }

    const selection = multiple
      ? selectedOptions.map((option) => (
          <span key={valueKey(option.value)} className={selectTagClass}>
            {renderValue(option)}
          </span>
        ))
      : renderValue(selectedOptions[0]);

    return (
      <div
        {...props}
        ref={ref}
        className={getSelectContainerClasses({
          open,
          loading,
          disabled,
          full: true,
          className,
        })}
      >
        <button
          type="button"
          className={getSelectClasses({ size, status, disabled })}
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={selectSelectionClass}>
            {hasValue ? (
              selection
            ) : (
              <span className={selectPlaceholderClass}>{placeholder}</span>
            )}
          </span>
          <span className={selectIconClass} aria-hidden="true">
            v
          </span>
        </button>
        {allowClear && hasValue && !disabled && !loading ? (
          <button
            type="button"
            className={selectClearClass}
            aria-label="Clear selection"
            onClick={clearValue}
          >
            x
          </button>
        ) : null}
        {open ? (
          <div
            className={selectDropdownClass}
            role="listbox"
            aria-multiselectable={multiple || undefined}
          >
            {searchable ? (
              <input
                className={selectSearchClass}
                value={searchValue}
                placeholder={
                  typeof placeholder === "string" ? placeholder : undefined
                }
                onChange={(event) => setSearchValue(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
              />
            ) : null}
            {visibleOptions.length > 0 ? (
              renderOptions(visibleOptions)
            ) : (
              <div className={selectEmptyClass}>No data</div>
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

SelectRoot.displayName = "Select";

export const Select = SelectRoot as SelectComponent;
Select.Option = Option;
Select.OptGroup = OptGroup;
