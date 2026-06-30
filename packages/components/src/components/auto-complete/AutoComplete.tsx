import React, { forwardRef, useId, useMemo, useRef, useState } from "react";
import {
  autoCompleteClearClass,
  autoCompleteInputWrapperClass,
  autoCompleteNoOptionsClass,
  autoCompleteOptionsClass,
  autoCompleteToggleClass,
  getAutoCompleteClasses,
  getAutoCompleteDropdownClasses,
  getAutoCompleteInputClasses,
  getAutoCompleteOptionClasses,
} from "../../classes/auto-complete";
import type {
  AutoCompleteComponent,
  AutoCompleteOptionProps,
  AutoCompleteOptionType,
  AutoCompleteProps,
} from "./AutoComplete.types";

function optionLabel(option: AutoCompleteOptionType) {
  return option.label ?? option.value;
}

function optionText(option: AutoCompleteOptionType) {
  const label = optionLabel(option);
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : option.value;
}

function optionsFromChildren(
  children: React.ReactNode,
): AutoCompleteOptionType[] {
  const result: AutoCompleteOptionType[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== Option) {
      return;
    }

    const props = child.props as AutoCompleteOptionProps;
    result.push({
      value: props.value,
      label: props.children,
      disabled: props.disabled,
      className: props.className,
    });
  });

  return result;
}

function filterOptions(
  options: AutoCompleteOptionType[],
  inputValue: string,
  filterOption: AutoCompleteProps["filterOption"],
) {
  if (filterOption === false) {
    return options;
  }

  if (typeof filterOption === "function") {
    return options.filter((option) => filterOption(inputValue, option));
  }

  const query = inputValue.trim().toLowerCase();

  if (query.length === 0) {
    return options;
  }

  return options.filter((option) =>
    optionText(option).toLowerCase().includes(query),
  );
}

const Option = forwardRef<HTMLDivElement, AutoCompleteOptionProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ),
);

Option.displayName = "AutoComplete.Option";

const AutoCompleteRoot = forwardRef<HTMLDivElement, AutoCompleteProps>(
  (
    {
      allowClear,
      children,
      className,
      color,
      defaultOpen,
      defaultValue = "",
      disabled,
      filterOption,
      notFoundContent = "No data",
      onChange,
      onSearch,
      onSelect,
      open,
      options,
      placeholder,
      size = "md",
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = useId();
    const listboxId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const sourceOptions = useMemo(
      () => options ?? optionsFromChildren(children),
      [children, options],
    );
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const controlledValue = value !== undefined;
    const controlledOpen = open !== undefined;
    const currentValue = controlledValue ? value : internalValue;
    const isOpen = controlledOpen ? open : internalOpen;
    const visibleOptions = useMemo(
      () => filterOptions(sourceOptions, currentValue, filterOption),
      [currentValue, filterOption, sourceOptions],
    );
    const selectedIndex = visibleOptions.findIndex(
      (option) => option.value === currentValue,
    );
    const activeIndex = focusedIndex >= 0 ? focusedIndex : selectedIndex;
    const activeOption =
      activeIndex >= 0 ? visibleOptions[activeIndex] : undefined;
    const activeDescendant = activeOption
      ? `${listboxId}-option-${activeIndex}`
      : undefined;
    const showClear = allowClear && !disabled && currentValue.length > 0;

    function setOpenState(nextOpen: boolean) {
      if (!controlledOpen) {
        setInternalOpen(nextOpen);
      }

      if (!nextOpen) {
        setFocusedIndex(-1);
      }
    }

    function emitChange(nextValue: string, option?: AutoCompleteOptionType) {
      if (!controlledValue) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, option);
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
      const nextValue = event.currentTarget.value;

      emitChange(nextValue);
      onSearch?.(nextValue);

      if (!disabled) {
        setOpenState(true);
      }
    }

    function selectOption(option: AutoCompleteOptionType) {
      if (disabled || option.disabled) {
        return;
      }

      emitChange(option.value, option);
      onSelect?.(option.value, option);
      setOpenState(false);
    }

    function clearValue() {
      if (disabled) {
        return;
      }

      emitChange("");
      onSearch?.("");
      setOpenState(false);
      inputRef.current?.focus();
    }

    function moveFocus(step: 1 | -1) {
      if (visibleOptions.length === 0) {
        return;
      }

      setOpenState(true);
      setFocusedIndex((current) => {
        const start = current >= 0 ? current : selectedIndex;
        const next = start + step;

        if (next < 0) {
          return visibleOptions.length - 1;
        }

        if (next >= visibleOptions.length) {
          return 0;
        }

        return next;
      });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (disabled) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveFocus(1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveFocus(-1);
        return;
      }

      if (event.key === "Enter" && isOpen && activeOption) {
        event.preventDefault();
        selectOption(activeOption);
        return;
      }

      if (event.key === "Escape") {
        setOpenState(false);
      }
    }

    function renderOption(option: AutoCompleteOptionType, index: number) {
      const selected = option.value === currentValue;
      const focused = index === activeIndex;

      return (
        <button
          key={option.value}
          type="button"
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={selected}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          className={getAutoCompleteOptionClasses({
            selected,
            focused,
            disabled: option.disabled,
            className: option.className,
          })}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => setFocusedIndex(index)}
          onClick={() => selectOption(option)}
        >
          {optionLabel(option)}
        </button>
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getAutoCompleteClasses({
          color,
          disabled,
          open: isOpen,
          className,
        })}
      >
        <div className={autoCompleteInputWrapperClass}>
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={isOpen ? listboxId : undefined}
            aria-expanded={isOpen}
            aria-activedescendant={activeDescendant}
            aria-disabled={disabled || undefined}
            className={getAutoCompleteInputClasses({ size })}
            disabled={disabled}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (!disabled) {
                setOpenState(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />
          {showClear ? (
            <button
              type="button"
              className={autoCompleteClearClass}
              aria-label="Clear selection"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearValue}
            >
              x
            </button>
          ) : null}
          <button
            type="button"
            className={autoCompleteToggleClass}
            aria-label={isOpen ? "Close options" : "Open options"}
            aria-controls={listboxId}
            aria-expanded={isOpen}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setOpenState(!isOpen)}
          >
            v
          </button>
        </div>
        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className={getAutoCompleteDropdownClasses({ open: isOpen })}
          >
            {visibleOptions.length > 0 ? (
              <div className={autoCompleteOptionsClass}>
                {visibleOptions.map(renderOption)}
              </div>
            ) : notFoundContent != null ? (
              <div className={autoCompleteNoOptionsClass}>
                {notFoundContent}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

AutoCompleteRoot.displayName = "AutoComplete";

export const AutoComplete = AutoCompleteRoot as AutoCompleteComponent;
AutoComplete.Option = Option;
