import React, { forwardRef, useMemo, useState } from "react";
import {
  getTreeSelectClasses,
  getTreeSelectContainerClasses,
  getTreeSelectNodeClasses,
  treeSelectCheckboxClass,
  treeSelectClearClass,
  treeSelectDropdownClass,
  treeSelectEmptyClass,
  treeSelectIconClass,
  treeSelectListClass,
  treeSelectPlaceholderClass,
  treeSelectSearchClass,
  treeSelectSelectionClass,
  treeSelectSwitcherClass,
  treeSelectTagClass,
  treeSelectTitleClass,
} from "../../classes/tree-select";
import type {
  TreeSelectChangeExtra,
  TreeSelectComponent,
  TreeSelectDataNode,
  TreeSelectNodeProps,
  TreeSelectProps,
  TreeSelectRawValue,
  TreeSelectValue,
} from "./TreeSelect.types";

const SHOW_ALL = "SHOW_ALL" as const;
const SHOW_PARENT = "SHOW_PARENT" as const;
const SHOW_CHILD = "SHOW_CHILD" as const;

interface FlatTreeSelectNode<T extends TreeSelectDataNode> {
  node: T;
  value: TreeSelectValue;
  key: string;
  title: React.ReactNode;
  parentKey?: string;
  children: FlatTreeSelectNode<T>[];
  level: number;
}

function nodeValue(node: TreeSelectDataNode): TreeSelectValue | undefined {
  return node.value ?? node.key;
}

function nodeTitle(node: TreeSelectDataNode) {
  return node.title ?? node.label ?? nodeValue(node);
}

function valueKey(value: TreeSelectValue) {
  return String(value);
}

function normalizeSingleValue(value: TreeSelectRawValue | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function normalizeMultiValue(value: TreeSelectRawValue | undefined) {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is TreeSelectValue =>
        typeof item === "string" || typeof item === "number",
    );
  }

  const single = normalizeSingleValue(value);
  return single === undefined ? [] : [single];
}

function uniqueValues(values: TreeSelectValue[]) {
  return Array.from(new Map(values.map((value) => [valueKey(value), value])).values());
}

function treeDataFromChildren(children: React.ReactNode): TreeSelectDataNode[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<TreeSelectNodeProps>(child)) {
      return [];
    }

    const {
      value,
      title,
      children: childChildren,
      disabled,
      disableCheckbox,
      selectable,
      checkable,
      isLeaf,
      className,
    } = child.props;

    return [
      {
        value,
        key: child.key ?? value,
        title,
        disabled,
        disableCheckbox,
        selectable,
        checkable,
        isLeaf,
        className,
        children: treeDataFromChildren(childChildren),
      },
    ];
  });
}

function buildTree<T extends TreeSelectDataNode>(
  nodes: T[],
  level = 0,
  parentKey: string | undefined = undefined,
): FlatTreeSelectNode<T>[] {
  return nodes.flatMap((node) => {
    const value = nodeValue(node);

    if (value === undefined) {
      return [];
    }

    const key = valueKey(value);
    const item: FlatTreeSelectNode<T> = {
      node,
      value,
      key,
      title: nodeTitle(node),
      parentKey,
      children: [],
      level,
    };

    item.children = buildTree((node.children ?? []) as T[], level + 1, key);
    return [item];
  });
}

function flattenTree<T extends TreeSelectDataNode>(
  nodes: FlatTreeSelectNode<T>[],
): FlatTreeSelectNode<T>[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

function descendantKeys<T extends TreeSelectDataNode>(item: FlatTreeSelectNode<T>) {
  return flattenTree(item.children).map((child) => child.key);
}

function defaultFilter<T extends TreeSelectDataNode>(
  inputValue: string,
  item: FlatTreeSelectNode<T>,
  filterTreeNode: TreeSelectProps<T>["filterTreeNode"],
) {
  if (!inputValue || filterTreeNode === false) {
    return true;
  }

  if (typeof filterTreeNode === "function") {
    return filterTreeNode(inputValue, item.node);
  }

  return String(item.title ?? item.value)
    .toLowerCase()
    .includes(inputValue.toLowerCase());
}

function filterTree<T extends TreeSelectDataNode>(
  nodes: FlatTreeSelectNode<T>[],
  inputValue: string,
  filterTreeNode: TreeSelectProps<T>["filterTreeNode"],
): FlatTreeSelectNode<T>[] {
  if (!inputValue || filterTreeNode === false) {
    return nodes;
  }

  return nodes.flatMap((node) => {
    const children = filterTree(node.children, inputValue, filterTreeNode);
    const matched = defaultFilter(inputValue, node, filterTreeNode);

    return matched || children.length > 0
      ? [{ ...node, children }]
      : [];
  });
}

function hasCheckedDescendant<T extends TreeSelectDataNode>(
  item: FlatTreeSelectNode<T>,
  checkedKeys: Set<string>,
) {
  return flattenTree(item.children).some((child) => checkedKeys.has(child.key));
}

function hasCheckedAncestor<T extends TreeSelectDataNode>(
  item: FlatTreeSelectNode<T>,
  flatNodes: FlatTreeSelectNode<T>[],
  checkedKeys: Set<string>,
) {
  let parentKey = item.parentKey;

  while (parentKey) {
    if (checkedKeys.has(parentKey)) {
      return true;
    }

    parentKey = flatNodes.find((node) => node.key === parentKey)?.parentKey;
  }

  return false;
}

function displayItems<T extends TreeSelectDataNode>(
  selectedItems: FlatTreeSelectNode<T>[],
  flatNodes: FlatTreeSelectNode<T>[],
  checkedKeys: Set<string>,
  strategy: TreeSelectProps<T>["treeCheckedStrategy"],
) {
  if (strategy === SHOW_CHILD) {
    return selectedItems.filter((item) => !hasCheckedAncestor(item, flatNodes, checkedKeys));
  }

  if (strategy === SHOW_PARENT) {
    return selectedItems.filter((item) => !hasCheckedDescendant(item, checkedKeys));
  }

  return selectedItems;
}

function labelForValue<T extends TreeSelectDataNode>(
  value: TreeSelectValue,
  flatNodes: FlatTreeSelectNode<T>[],
) {
  return flatNodes.find((item) => item.value === value)?.title ?? value;
}

const TreeNode = forwardRef<HTMLDivElement, TreeSelectNodeProps>(
  ({ title, children, disabled, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      aria-disabled={disabled || undefined}
      className={className}
    >
      {title}
      {children}
    </div>
  ),
);

TreeNode.displayName = "TreeSelect.TreeNode";

function TreeSelectRoot<T extends TreeSelectDataNode>(
  {
    allowClear,
    children,
    className,
    defaultOpen,
    defaultValue,
    defaultExpandedKeys,
    defaultTreeExpandedKeys,
    disabled,
    expandedKeys,
    filterTreeNode,
    loadData,
    multiple,
    onChange,
    onDropdownVisibleChange,
    onSearch,
    onSelect,
    open,
    placeholder = "Please select",
    searchValue,
    showSearch,
    treeCheckable,
    treeCheckedStrategy = SHOW_CHILD,
    treeData,
    treeDefaultExpandAll,
    treeExpandedKeys,
    value,
    ...props
  }: TreeSelectProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const checkable = Boolean(treeCheckable);
  const multi = Boolean(multiple || treeCheckable);
  const sourceTree = useMemo(
    () => (treeData ?? treeDataFromChildren(children)) as T[],
    [children, treeData],
  );
  const tree = useMemo(() => buildTree(sourceTree), [sourceTree]);
  const flatNodes = useMemo(() => flattenTree(tree), [tree]);
  const allKeys = useMemo(() => flatNodes.map((item) => item.key), [flatNodes]);
  const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
  const [internalSearch, setInternalSearch] = useState("");
  const [internalValue, setInternalValue] = useState<TreeSelectRawValue | undefined>(
    multi ? normalizeMultiValue(defaultValue) : normalizeSingleValue(defaultValue),
  );
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<string[]>(
    treeDefaultExpandAll
      ? allKeys
      : (defaultExpandedKeys ?? defaultTreeExpandedKeys ?? []).map(valueKey),
  );
  const controlledOpen = open !== undefined;
  const currentOpen = controlledOpen ? Boolean(open) : internalOpen;
  const controlledValue = value !== undefined;
  const currentValue = controlledValue ? value : internalValue;
  const currentSearch = searchValue ?? internalSearch;
  const controlledExpandedKeys = expandedKeys ?? treeExpandedKeys;
  const currentExpandedKeys = controlledExpandedKeys
    ? controlledExpandedKeys.map(valueKey)
    : internalExpandedKeys;
  const expandedKeySet = new Set(currentExpandedKeys);
  const selectedValues = multi
    ? normalizeMultiValue(currentValue)
    : normalizeSingleValue(currentValue) === undefined
      ? []
      : [normalizeSingleValue(currentValue) as TreeSelectValue];
  const selectedKeys = new Set(selectedValues.map(valueKey));
  const selectedItems = selectedValues.map((selectedValue) => {
    const found = flatNodes.find((item) => item.value === selectedValue);
    return found ?? {
      node: { value: selectedValue, title: selectedValue } as T,
      value: selectedValue,
      key: valueKey(selectedValue),
      title: selectedValue,
      children: [],
      level: 0,
    };
  });
  const visibleTree = filterTree(tree, currentSearch, filterTreeNode);
  const visibleFlatNodes = flattenTree(visibleTree);
  const hasValue = selectedValues.length > 0;
  const searchable = showSearch || currentSearch.length > 0;

  function setDropdownOpen(nextOpen: boolean) {
    if (disabled) {
      return;
    }

    if (!controlledOpen) {
      setInternalOpen(nextOpen);
    }

    onDropdownVisibleChange?.(nextOpen);
  }

  function setExpanded(nextExpandedKeys: string[], item: FlatTreeSelectNode<T>) {
    if (!controlledExpandedKeys) {
      setInternalExpandedKeys(nextExpandedKeys);
    }

    if (!expandedKeySet.has(item.key)) {
      void loadData?.(item.node);
    }
  }

  function emitChange(
    nextValues: TreeSelectValue[],
    trigger: FlatTreeSelectNode<T>,
    selected: boolean,
  ) {
    const normalizedValues = multi
      ? uniqueValues(nextValues)
      : nextValues.slice(0, 1);
    const nextValue = multi ? normalizedValues : normalizedValues[0];
    const labels = normalizedValues.map((item) => labelForValue(item, flatNodes));
    const extra: TreeSelectChangeExtra<T> = {
      triggerValue: trigger.value,
      selected,
      checked: checkable ? selected : undefined,
      triggerNode: trigger.node,
      allCheckedNodes: checkable
        ? flatNodes
            .filter((item) => normalizedValues.map(valueKey).includes(item.key))
            .map((item) => item.node)
        : undefined,
    };

    if (!controlledValue) {
      setInternalValue(nextValue);
    }

    onChange?.(
      nextValue,
      multi ? labels : labels[0],
      extra,
    );
  }

  function selectItem(item: FlatTreeSelectNode<T>) {
    if (disabled || item.node.disabled || item.node.selectable === false) {
      return;
    }

    const selected = selectedKeys.has(item.key);
    let nextValues: TreeSelectValue[];

    if (multi) {
      const cascadeKeys = checkable ? [item.key, ...descendantKeys(item)] : [item.key];
      const cascadeValues = flatNodes
        .filter((node) => cascadeKeys.includes(node.key))
        .map((node) => node.value);

      nextValues = selected
        ? selectedValues.filter((itemValue) => !cascadeKeys.includes(valueKey(itemValue)))
        : [...selectedValues, ...cascadeValues];
    } else {
      nextValues = selected ? [] : [item.value];
      setDropdownOpen(false);
    }

    emitChange(nextValues, item, !selected);
    onSelect?.(item.value, item.node, {
      triggerValue: item.value,
      selected: !selected,
      checked: checkable ? !selected : undefined,
      triggerNode: item.node,
    });
  }

  function clearValue(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (disabled) {
      return;
    }

    if (!controlledValue) {
      setInternalValue(multi ? [] : undefined);
    }

    onChange?.(multi ? [] : undefined, multi ? [] : undefined, {});
  }

  function renderNode(item: FlatTreeSelectNode<T>) {
    const expanded = expandedKeySet.has(item.key);
    const selected = selectedKeys.has(item.key);
    const childVisible = expanded || currentSearch.length > 0;
    const hasChildren = item.children.length > 0;
    const nodeDisabled = disabled || item.node.disabled;
    const selectable = item.node.selectable !== false;

    return (
      <div key={item.key}>
        <div
          className={getTreeSelectNodeClasses({
            selected,
            checked: selected,
            expanded,
            disabled: nodeDisabled,
            className: item.node.className,
          })}
          style={{ paddingLeft: item.level * 16 }}
        >
          {hasChildren || item.node.isLeaf === false ? (
            <button
              type="button"
              className={treeSelectSwitcherClass}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${String(item.title)}`}
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(
                  expanded
                    ? currentExpandedKeys.filter((key) => key !== item.key)
                    : [...currentExpandedKeys, item.key],
                  item,
                );
              }}
            >
              {expanded ? "-" : "+"}
            </button>
          ) : (
            <span className={treeSelectSwitcherClass} aria-hidden="true" />
          )}
          {checkable ? (
            <input
              type="checkbox"
              className={treeSelectCheckboxClass}
              checked={selected}
              disabled={nodeDisabled || item.node.disableCheckbox}
              aria-label={`Check ${String(item.title)}`}
              onChange={() => selectItem(item)}
            />
          ) : null}
          <button
            type="button"
            role="treeitem"
            aria-selected={selected}
            aria-expanded={hasChildren ? expanded : undefined}
            disabled={nodeDisabled || !selectable}
            className={treeSelectTitleClass}
            onClick={() => selectItem(item)}
          >
            {item.title}
          </button>
        </div>
        {hasChildren && childVisible ? item.children.map(renderNode) : null}
      </div>
    );
  }

  const renderedItems = displayItems(
    selectedItems,
    flatNodes,
    selectedKeys,
    treeCheckedStrategy,
  );
  const selection = multi ? (
    renderedItems.map((item) => (
      <span key={item.key} className={treeSelectTagClass}>
        {item.title}
      </span>
    ))
  ) : (
    renderedItems[0]?.title
  );

  return (
    <div
      {...props}
      ref={ref}
      className={getTreeSelectContainerClasses({
        open: currentOpen,
        disabled,
        multiple: multi,
        className,
      })}
    >
      <button
        type="button"
        className={getTreeSelectClasses({ disabled })}
        disabled={disabled}
        aria-haspopup="tree"
        aria-expanded={currentOpen}
        onClick={() => setDropdownOpen(!currentOpen)}
      >
        <span className={treeSelectSelectionClass}>
          {hasValue ? (
            selection
          ) : (
            <span className={treeSelectPlaceholderClass}>{placeholder}</span>
          )}
        </span>
        <span className={treeSelectIconClass} aria-hidden="true">
          v
        </span>
      </button>
      {allowClear && hasValue && !disabled ? (
        <button
          type="button"
          className={treeSelectClearClass}
          aria-label="Clear selection"
          onClick={clearValue}
        >
          x
        </button>
      ) : null}
      {currentOpen ? (
        <div className={treeSelectDropdownClass}>
          {searchable ? (
            <input
              className={treeSelectSearchClass}
              value={currentSearch}
              placeholder={typeof placeholder === "string" ? placeholder : undefined}
              onChange={(event) => {
                const nextSearch = event.currentTarget.value;

                if (searchValue === undefined) {
                  setInternalSearch(nextSearch);
                }

                onSearch?.(nextSearch);
              }}
            />
          ) : null}
          <div className={treeSelectListClass} role="tree" aria-multiselectable={multi || undefined}>
            {visibleFlatNodes.length > 0 && visibleTree.length > 0 ? (
              visibleTree.map(renderNode)
            ) : (
              <div className={treeSelectEmptyClass}>No data</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const TreeSelect = forwardRef(TreeSelectRoot) as unknown as TreeSelectComponent;
TreeSelect.displayName = "TreeSelect";
TreeSelect.TreeNode = TreeNode;
TreeSelect.SHOW_ALL = SHOW_ALL;
TreeSelect.SHOW_PARENT = SHOW_PARENT;
TreeSelect.SHOW_CHILD = SHOW_CHILD;
