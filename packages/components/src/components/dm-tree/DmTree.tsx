import React, { useMemo, useState } from "react";
import {
  dmTreeBodyClass,
  dmTreeContentClass,
  dmTreeIconToolbarClass,
  dmTreeItemToolbarClass,
  dmTreeNodePrefixClass,
  dmTreeNodeTitleClass,
  dmTreeSearchClass,
  dmTreeToolbarClass,
  getDmTreeAllButtonClasses,
  getDmTreeClasses,
  getDmTreeItemToolbarClasses,
} from "../../classes/dm-tree";
import { Input } from "../input";
import { DmStatus } from "../dm-status";
import { DmTabs } from "../dm-tabs";
import { Tree } from "../tree";
import type { TreeKey, TreeProps } from "../tree/Tree.types";
import type {
  DmTreeCommonProps,
  DmTreeComponent,
  DmTreeDataNode,
  DmTreeFieldNames,
  DmTreeItemAction,
  DmTreeProps,
  DmTreeToolbarButton,
} from "./DmTree.types";
import type { TreeDataNode } from "../tree/Tree.types";

const defaultFieldNames = {
  title: "title",
  key: "key",
  children: "children",
} as const;

function cssSize(value: number | string | undefined) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function fieldName<TDataNode extends DmTreeDataNode>(
  fieldNames: DmTreeFieldNames<TDataNode> | undefined,
  name: keyof typeof defaultFieldNames,
) {
  return String(fieldNames?.[name] ?? defaultFieldNames[name]);
}

function readField(node: Record<string, unknown>, field: string) {
  return node[field];
}

function normalizeTreeData<TDataNode extends DmTreeDataNode>(
  treeData: TDataNode[],
  fieldNames?: DmTreeFieldNames<TDataNode>,
): TreeDataNode[] {
  const titleField = fieldName(fieldNames, "title");
  const keyField = fieldName(fieldNames, "key");
  const childrenField = fieldName(fieldNames, "children");

  return treeData.map((node) => {
    const record = node as Record<string, unknown>;
    const children = readField(record, childrenField);

    return {
      ...node,
      key: (readField(record, keyField) ?? node.key) as TreeKey,
      title: (readField(record, titleField) ?? node.title) as React.ReactNode,
      children: Array.isArray(children)
        ? normalizeTreeData(children as TDataNode[], fieldNames)
        : undefined,
      data: node,
    };
  });
}

function findNode<TDataNode extends DmTreeDataNode>(
  treeData: TDataNode[],
  key: TreeKey | undefined,
  fieldNames?: DmTreeFieldNames<TDataNode>,
) {
  if (key === undefined) return undefined;

  const keyField = fieldName(fieldNames, "key");
  const childrenField = fieldName(fieldNames, "children");
  const queue = [...treeData];

  for (const node of queue) {
    if (
      (node as Record<string, unknown>)[keyField] === key ||
      node.key === key
    ) {
      return node;
    }

    const children = (node as Record<string, unknown>)[childrenField];
    if (Array.isArray(children)) {
      queue.push(...(children as TDataNode[]));
    }
  }

  return undefined;
}

function filterTreeData<TDataNode extends DmTreeDataNode>(
  treeData: TDataNode[],
  search: string,
  fieldNames?: DmTreeFieldNames<TDataNode>,
): TDataNode[] {
  if (!search) return treeData;

  const titleField = fieldName(fieldNames, "title");
  const childrenField = fieldName(fieldNames, "children");
  const needle = search.toLowerCase();

  return treeData.flatMap((node) => {
    const record = node as Record<string, unknown>;
    const children = record[childrenField];
    const filteredChildren = Array.isArray(children)
      ? filterTreeData(children as TDataNode[], search, fieldNames)
      : [];
    const title = String(record[titleField] ?? node.title ?? "");
    const matched = title.toLowerCase().includes(needle);

    if (!matched && filteredChildren.length === 0) return [];

    return [
      {
        ...node,
        [childrenField]:
          filteredChildren.length > 0 ? filteredChildren : undefined,
      },
    ];
  });
}

function parentKeys<TDataNode extends DmTreeDataNode>(
  treeData: TDataNode[] | undefined,
  fieldNames?: DmTreeFieldNames<TDataNode>,
) {
  if (!treeData) return [];
  const keyField = fieldName(fieldNames, "key");
  const childrenField = fieldName(fieldNames, "children");
  const keys: TreeKey[] = [];

  function visit(nodes: TDataNode[]) {
    nodes.forEach((node) => {
      const children = (node as Record<string, unknown>)[childrenField];
      if (Array.isArray(children) && children.length > 0) {
        keys.push(
          ((node as Record<string, unknown>)[keyField] ?? node.key) as TreeKey,
        );
        visit(children as TDataNode[]);
      }
    });
  }

  visit(treeData);
  return keys;
}

function renderToolbar<TDataNode extends DmTreeDataNode>(
  toolbar:
    | DmTreeToolbarButton<TDataNode>[]
    | ((
        selectedKey: TreeKey | undefined,
        getSelectedItem: () => TDataNode | undefined,
      ) => React.ReactNode)
    | undefined,
  selectedKey: TreeKey | undefined,
  getSelectedItem: () => TDataNode | undefined,
) {
  if (!toolbar) return null;

  if (typeof toolbar === "function") {
    return toolbar(selectedKey, getSelectedItem);
  }

  return toolbar.map((item, index) => (
    <button
      key={index}
      type="button"
      disabled={item.disabled}
      title={typeof item.label === "string" ? item.label : undefined}
      onClick={() => item.onClick?.(selectedKey, getSelectedItem)}
    >
      {item.icon}
      {item.label}
    </button>
  ));
}

function shouldShowAction<TDataNode extends DmTreeDataNode>(
  action: DmTreeItemAction<TDataNode>,
  item: TDataNode,
) {
  if (typeof action.show === "function") return action.show(item);
  return action.show !== false;
}

function isActionDisabled<TDataNode extends DmTreeDataNode>(
  action: DmTreeItemAction<TDataNode>,
  item: TDataNode,
) {
  if (typeof action.disabled === "function") return action.disabled(item);
  return Boolean(action.disabled);
}

function CommonDmTree<TDataNode extends DmTreeDataNode>({
  treeData = [],
  selectedKey,
  showAll = true,
  allItem = { value: 0, label: "All" },
  buttonTopToolbar,
  iconTopToolbar,
  customTopToolbar,
  itemToolbar,
  itemToolbarAlwaysShow,
  beforeSelect,
  onChange,
  loading,
  showSearch,
  searchPlaceholder = "Search",
  customSearch,
  beforeIcon,
  emptyNode,
  width = "auto",
  minNodeWidth = "3rem",
  fieldNames,
  className,
  style,
  defaultExpandedKeys,
  expandedKeys,
  onExpand,
  showLine,
  ...treeProps
}: DmTreeCommonProps<TDataNode>) {
  const [searchValue, setSearchValue] = useState("");
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<TreeKey[]>(
    () => defaultExpandedKeys ?? parentKeys(treeData, fieldNames),
  );
  const filteredTree = useMemo(
    () =>
      customSearch || !searchValue
        ? treeData
        : filterTreeData(treeData, searchValue, fieldNames),
    [customSearch, fieldNames, searchValue, treeData],
  );
  const normalizedTree = useMemo(
    () => normalizeTreeData(filteredTree, fieldNames),
    [fieldNames, filteredTree],
  );
  const searchExpandedKeys = useMemo(
    () => parentKeys(filteredTree, fieldNames),
    [fieldNames, filteredTree],
  );
  const treeExpandedKeys =
    expandedKeys ??
    (searchValue && !customSearch ? searchExpandedKeys : internalExpandedKeys);
  const selectedItem = () => findNode(treeData, selectedKey, fieldNames);
  const autoWidth = width === "auto";
  const mergedWidth = autoWidth ? "100%" : cssSize(width);

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.currentTarget.value);
    customSearch?.(event);
  }

  function commitSelection(nextItem: TDataNode, nextKey: TreeKey) {
    onChange?.(nextItem, nextKey, selectedKey);
  }

  function handleSelect(keys: TreeKey[]) {
    const nextKey = keys[0];
    const nextItem = findNode(treeData, nextKey, fieldNames);
    if (!nextItem || nextKey === undefined) return;

    const allowed = beforeSelect?.(nextItem, nextKey, selectedKey);

    if (
      allowed &&
      typeof (allowed as Promise<boolean | void>).then === "function"
    ) {
      void Promise.resolve(allowed).then((result) => {
        if (result !== false) commitSelection(nextItem, nextKey);
      });
      return;
    }

    if (allowed !== false) {
      commitSelection(nextItem, nextKey);
    }
  }

  function renderTitle(node: TreeDataNode) {
    const source =
      (node.data as TDataNode | undefined) ?? (node as unknown as TDataNode);
    const titleField = fieldName(fieldNames, "title");
    const title =
      (source as Record<string, unknown>)[titleField] ?? source.title;
    const actions =
      typeof itemToolbar === "function" ? (
        itemToolbar(source)
      ) : Array.isArray(itemToolbar) ? (
        <span
          className={getDmTreeItemToolbarClasses({
            alwaysShow: itemToolbarAlwaysShow,
          })}
        >
          {itemToolbar
            .filter((action) => shouldShowAction(action, source))
            .map((action, index) => {
              const disabled = isActionDisabled(action, source);

              return (
                <button
                  key={index}
                  type="button"
                  className={dmTreeItemToolbarClass}
                  aria-label={action.title}
                  title={action.title}
                  disabled={disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!disabled) action.onClick?.(source);
                  }}
                >
                  {action.icon}
                </button>
              );
            })}
        </span>
      ) : null;

    return (
      <span className={dmTreeNodeTitleClass}>
        {beforeIcon ? (
          <span className={dmTreeNodePrefixClass}>
            {typeof beforeIcon === "function" ? beforeIcon(source) : beforeIcon}
          </span>
        ) : null}
        <span style={{ minWidth: cssSize(minNodeWidth) }}>
          {title as React.ReactNode}
        </span>
        {actions}
      </span>
    );
  }

  return (
    <div
      className={getDmTreeClasses({ autoWidth, className })}
      style={{ width: mergedWidth, height: "100%", ...style }}
    >
      <div className={dmTreeContentClass}>
        {customTopToolbar ? (
          <div className={dmTreeToolbarClass}>{customTopToolbar}</div>
        ) : null}
        {buttonTopToolbar ? (
          <div className={dmTreeToolbarClass}>
            {renderToolbar(buttonTopToolbar, selectedKey, selectedItem)}
          </div>
        ) : null}
        {iconTopToolbar ? (
          <div className={dmTreeIconToolbarClass}>
            {renderToolbar(iconTopToolbar, selectedKey, selectedItem)}
          </div>
        ) : null}
        {showAll ? (
          <button
            type="button"
            className={getDmTreeAllButtonClasses({
              selected: selectedKey === allItem.value,
            })}
            onClick={() => onChange?.(undefined, allItem.value, selectedKey)}
          >
            {allItem.label}
          </button>
        ) : null}
        {showSearch ? (
          <div className={dmTreeSearchClass}>
            <Input
              allowClear
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearch}
            />
          </div>
        ) : null}
        <div className={dmTreeBodyClass}>
          {loading ? (
            <DmStatus status="loading" />
          ) : normalizedTree.length > 0 ? (
            <Tree
              {...(treeProps as Omit<TreeProps<TreeDataNode>, "treeData">)}
              treeData={normalizedTree}
              selectedKeys={selectedKey === undefined ? [] : [selectedKey]}
              expandedKeys={treeExpandedKeys}
              showLine={showLine ?? parentKeys(treeData, fieldNames).length > 0}
              blockNode
              titleRender={renderTitle}
              onSelect={(keys) => handleSelect(keys)}
              onExpand={(keys, info) => {
                setInternalExpandedKeys(keys);
                onExpand?.(keys, info);
              }}
            />
          ) : (
            (emptyNode ?? <DmStatus status="empty" />)
          )}
        </div>
      </div>
    </div>
  );
}

function OptionDmTree<TDataNode extends DmTreeDataNode>(
  props: Extract<DmTreeProps<TDataNode>, { isTabTree: true }>,
) {
  const {
    items,
    defaultActiveKey,
    activeKey,
    clearOtherSelection = true,
    width = "auto",
    minNodeWidth,
    onChange,
    className,
    style,
    isTabTree,
    ...rest
  } = props;
  void isTabTree;
  const tabItems = items.map(({ TreeSetting, key, ...item }) => ({
    ...item,
    key,
    children: (
      <CommonDmTree<TDataNode>
        {...TreeSetting}
        minNodeWidth={TreeSetting.minNodeWidth ?? minNodeWidth}
        onChange={(node, selected, before) => {
          if (clearOtherSelection) {
            items.forEach((other) => {
              if (
                other.key !== key &&
                other.TreeSetting.selectedKey !== undefined
              ) {
                other.TreeSetting.onChange?.(
                  undefined,
                  undefined,
                  other.TreeSetting.selectedKey,
                );
              }
            });
          }

          TreeSetting.onChange?.(node, selected, before);
        }}
      />
    ),
  }));

  return (
    <div
      {...rest}
      className={getDmTreeClasses({ optionTree: true, className })}
      style={{ width: cssSize(width) ?? "100%", height: "100%", ...style }}
    >
      <DmTabs
        centered
        optionTree
        type="line"
        activeKey={activeKey}
        defaultActiveKey={defaultActiveKey}
        items={tabItems}
        onChange={onChange}
      />
    </div>
  );
}

export const DmTree = (<TDataNode extends DmTreeDataNode>(
  props: DmTreeProps<TDataNode>,
) => {
  if ("isTabTree" in props && props.isTabTree) {
    return <OptionDmTree<TDataNode> {...props} />;
  }

  return CommonDmTree<TDataNode>(props as DmTreeCommonProps<TDataNode>);
}) as DmTreeComponent;

export default DmTree;
