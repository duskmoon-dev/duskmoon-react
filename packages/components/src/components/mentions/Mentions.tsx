import React, { forwardRef, useId, useMemo, useRef, useState } from "react";
import {
  getMentionsClasses,
  getMentionsDropdownClasses,
  getMentionsOptionClasses,
  mentionsNoOptionsClass,
  mentionsOptionsClass,
  mentionsTextareaClass,
} from "../../classes/mentions";
import type {
  MentionsComponent,
  MentionsOptionProps,
  MentionsOptionType,
  MentionsProps,
} from "./Mentions.types";

interface MentionSearch {
  prefix: string;
  text: string;
  start: number;
  end: number;
}

function optionLabel(option: MentionsOptionType) {
  return option.label ?? option.value;
}

function optionText(option: MentionsOptionType) {
  const label = optionLabel(option);
  return typeof label === "string" || typeof label === "number"
    ? String(label)
    : option.value;
}

function optionsFromChildren(children: React.ReactNode): MentionsOptionType[] {
  const result: MentionsOptionType[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== Option) {
      return;
    }

    const props = child.props as MentionsOptionProps;
    result.push({
      value: props.value,
      label: props.children,
      disabled: props.disabled,
      className: props.className,
    });
  });

  return result;
}

function normalizePrefixes(prefix: string | string[] = "@") {
  return Array.isArray(prefix) ? prefix : [prefix];
}

function findMentionSearch(
  value: string,
  cursor: number,
  prefixes: string[],
  split: string,
): MentionSearch | null {
  const beforeCursor = value.slice(0, cursor);
  const matches = prefixes
    .map((prefix) => ({ prefix, index: beforeCursor.lastIndexOf(prefix) }))
    .filter(({ index }) => index >= 0)
    .sort((left, right) => right.index - left.index);

  for (const match of matches) {
    const textStart = match.index + match.prefix.length;
    const text = beforeCursor.slice(textStart);

    if (text.includes(split) || /\s/.test(text)) {
      continue;
    }

    return {
      prefix: match.prefix,
      text,
      start: match.index,
      end: cursor,
    };
  }

  return null;
}

function filterOptions(
  options: MentionsOptionType[],
  searchText: string,
  filterOption: MentionsProps["filterOption"],
) {
  if (filterOption === false) {
    return options;
  }

  if (typeof filterOption === "function") {
    return options.filter((option) => filterOption(searchText, option));
  }

  const query = searchText.trim().toLowerCase();

  if (query.length === 0) {
    return options;
  }

  return options.filter((option) =>
    optionText(option).toLowerCase().includes(query),
  );
}

const Option = forwardRef<HTMLDivElement, MentionsOptionProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ),
);

Option.displayName = "Mentions.Option";

const MentionsRoot = forwardRef<HTMLTextAreaElement, MentionsProps>(
  (
    {
      children,
      className,
      defaultValue = "",
      disabled,
      filterOption,
      notFoundContent = "No data",
      onChange,
      onSearch,
      onSelect,
      options,
      placement = "bottom",
      prefix = "@",
      split = " ",
      value,
      ...props
    },
    ref,
  ) => {
    const listboxId = useId();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const sourceOptions = useMemo(
      () => options ?? optionsFromChildren(children),
      [children, options],
    );
    const prefixes = useMemo(() => normalizePrefixes(prefix), [prefix]);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [search, setSearch] = useState<MentionSearch | null>(null);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internalValue;
    const visibleOptions = useMemo(
      () => filterOptions(sourceOptions, search?.text ?? "", filterOption),
      [filterOption, search?.text, sourceOptions],
    );
    const isOpen = Boolean(search) && !disabled;
    const activeOption =
      isOpen && visibleOptions.length > 0
        ? visibleOptions[Math.min(focusedIndex, visibleOptions.length - 1)]
        : undefined;
    const activeIndex = activeOption
      ? visibleOptions.indexOf(activeOption)
      : -1;
    const activeDescendant =
      activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

    function setTextareaRef(node: HTMLTextAreaElement | null) {
      textareaRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    function updateSearch(nextValue: string, cursor: number) {
      const nextSearch = findMentionSearch(nextValue, cursor, prefixes, split);

      setSearch(nextSearch);
      setFocusedIndex(0);

      if (nextSearch) {
        onSearch?.(nextSearch.text, nextSearch.prefix);
      }
    }

    function emitChange(nextValue: string) {
      if (!controlled) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue);
    }

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
      const nextValue = event.currentTarget.value;
      const cursor = event.currentTarget.selectionStart ?? nextValue.length;

      emitChange(nextValue);
      updateSearch(nextValue, cursor);
    }

    function selectOption(option: MentionsOptionType) {
      if (!search || disabled || option.disabled) {
        return;
      }

      const nextValue =
        currentValue.slice(0, search.start) +
        `${search.prefix}${option.value}${split}` +
        currentValue.slice(search.end);
      const nextCursor =
        search.start +
        search.prefix.length +
        option.value.length +
        split.length;

      emitChange(nextValue);
      onSelect?.(option, search.prefix);
      setSearch(null);
      setFocusedIndex(0);

      window.setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(nextCursor, nextCursor);
      }, 0);
    }

    function moveFocus(step: 1 | -1) {
      if (!isOpen || visibleOptions.length === 0) {
        return;
      }

      setFocusedIndex((current) => {
        const next = current + step;

        if (next < 0) {
          return visibleOptions.length - 1;
        }

        if (next >= visibleOptions.length) {
          return 0;
        }

        return next;
      });
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (disabled || !isOpen) {
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

      if (event.key === "Enter" && activeOption) {
        event.preventDefault();
        selectOption(activeOption);
        return;
      }

      if (event.key === "Escape") {
        setSearch(null);
      }
    }

    function handleClick(event: React.MouseEvent<HTMLTextAreaElement>) {
      const cursor = event.currentTarget.selectionStart ?? currentValue.length;

      updateSearch(currentValue, cursor);
      props.onClick?.(event);
    }

    function renderOption(option: MentionsOptionType, index: number) {
      const focused = index === activeIndex;

      return (
        <button
          key={option.value}
          type="button"
          id={`${listboxId}-option-${index}`}
          role="option"
          aria-selected={focused}
          aria-disabled={option.disabled || undefined}
          disabled={option.disabled}
          className={getMentionsOptionClasses({
            focused,
            selected: focused,
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
        className={getMentionsClasses({
          disabled,
          open: isOpen,
          placement,
          className,
        })}
      >
        <textarea
          {...props}
          ref={setTextareaRef}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={isOpen ? listboxId : undefined}
          aria-expanded={isOpen}
          aria-activedescendant={activeDescendant}
          aria-disabled={disabled || undefined}
          className={mentionsTextareaClass}
          disabled={disabled}
          value={currentValue}
          onChange={handleChange}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        />
        {isOpen ? (
          <div
            id={listboxId}
            role="listbox"
            className={getMentionsDropdownClasses({ placement })}
          >
            {visibleOptions.length > 0 ? (
              <div className={mentionsOptionsClass}>
                {visibleOptions.map(renderOption)}
              </div>
            ) : notFoundContent != null ? (
              <div className={mentionsNoOptionsClass}>{notFoundContent}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);

MentionsRoot.displayName = "Mentions";

export const Mentions = MentionsRoot as MentionsComponent;
Mentions.Option = Option;
