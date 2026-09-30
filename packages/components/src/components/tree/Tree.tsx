import React, { forwardRef, useMemo, useState } from "react";
import {
  getTreeClasses,
  getTreeNodeClasses,
  treeListClass,
  treeNodeCheckboxClass,
  treeNodeChildrenClass,
  treeNodeIconClass,
  treeNodeSwitcherClass,
  treeNodeTitleClass,
} from "../../classes/tree";
import { cn } from "../../utils";
import type {
  DirectoryTreeComponent,
  DirectoryTreeProps,
  EventDataNode,
  TreeCheckInfo,
  TreeComponent,
  TreeDataNode,
  TreeDragInfo,
  TreeDropInfo,
  TreeEventInfo,
  TreeExpandInfo,
  TreeKey,
  TreeNodeComponent,
  TreeNodeProps,
  TreeProps,
  TreeSelectInfo,
} from "./Tree.types";

interface FlatTreeNode<T extends TreeDataNode> {
  key: TreeKey;
  keyString: string;
  node: T;
  parentKey?: string;
  children: FlatTreeNode<T>[];
  level: number;
  pos: string;
}

function normalizeKeys(keys?: TreeKey[]) {
  return keys?.map(String) ?? [];
}

function uniqueKeys(keys: string[]) {
  return Array.from(new Set(keys));
}

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function isCurrentTreeItemEvent(event: React.SyntheticEvent<HTMLElement>) {
  return (
    event.target instanceof Element &&
    event.target.closest('[role="treeitem"]') === event.currentTarget
  );
}

function isActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

function buildFlatTree<T extends TreeDataNode>(
  nodes: T[],
  level = 0,
  parentKey: string | undefined = undefined,
  parentPos = "0",
): FlatTreeNode<T>[] {
  return nodes.map((node, index) => {
    const keyString = String(node.key);
    const pos = `${parentPos}-${index}`;
    const item: FlatTreeNode<T> = {
      key: node.key,
      keyString,
      node,
      parentKey,
      children: [],
      level,
      pos,
    };

    item.children = buildFlatTree(
      (node.children ?? []) as T[],
      level + 1,
      keyString,
      pos,
    );

    return item;
  });
}

function flattenTree<T extends TreeDataNode>(
  nodes: FlatTreeNode<T>[],
): FlatTreeNode<T>[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)]);
}

function descendantKeys<T extends TreeDataNode>(
  node: FlatTreeNode<T>,
): string[] {
  return flattenTree(node.children).map((child) => child.keyString);
}

function eventNode<T extends TreeDataNode>(
  item: FlatTreeNode<T>,
): EventDataNode<T> {
  return {
    ...item.node,
    key: item.key,
    pos: item.pos,
    data: item.node,
  };
}

function eventInfo<T extends TreeDataNode>(
  item: FlatTreeNode<T>,
  nativeEvent: TreeEventInfo<T>["nativeEvent"],
): TreeEventInfo<T> {
  return {
    node: eventNode(item),
    nativeEvent,
  };
}

function checkedNodesFromKeys<T extends TreeDataNode>(
  flatNodes: FlatTreeNode<T>[],
  keys: string[],
) {
  const keySet = new Set(keys);
  return flatNodes
    .filter((item) => keySet.has(item.keyString))
    .map((item) => item.node);
}

function treeDataFromChildren(children: React.ReactNode): TreeDataNode[] {
  return React.Children.toArray(children).flatMap((child, index) => {
    if (!React.isValidElement<TreeNodeProps>(child)) {
      return [];
    }

    const {
      title,
      eventKey,
      children: childChildren,
      disabled,
      disableCheckbox,
      selectable,
      checkable,
      icon,
      isLeaf,
      className,
    } = child.props;

    return [
      {
        key: eventKey ?? child.key ?? index,
        title,
        disabled,
        disableCheckbox,
        selectable,
        checkable,
        icon,
        isLeaf,
        className,
        children: treeDataFromChildren(childChildren),
      },
    ];
  });
}

const TreeNode = forwardRef<HTMLDivElement, TreeNodeProps>(
  (
    {
      title,
      children,
      disabled,
      checkable,
      selectable,
      icon,
      className,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      aria-disabled={disabled || undefined}
      className={getTreeNodeClasses({ disabled, className })}
    >
      {checkable ? (
        <input
          type="checkbox"
          className={treeNodeCheckboxClass}
          disabled={disabled}
          readOnly
        />
      ) : null}
      {hasNode(icon) ? <span className={treeNodeIconClass}>{icon}</span> : null}
      <span className={treeNodeTitleClass}>{title}</span>
      {selectable === false ? null : children}
    </div>
  ),
);

TreeNode.displayName = "Tree.TreeNode";

function TreeRoot<T extends TreeDataNode>(
  {
    treeData,
    children,
    expandedKeys,
    defaultExpandedKeys,
    selectedKeys,
    defaultSelectedKeys,
    checkedKeys,
    defaultCheckedKeys,
    checkable,
    selectable = true,
    multiple,
    disabled,
    showLine,
    showIcon,
    draggable,
    blockNode,
    defaultExpandAll,
    loadData,
    titleRender,
    onExpand,
    onSelect,
    onCheck,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop,
    className,
    ...props
  }: TreeProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const data = useMemo(
    () => (treeData ?? treeDataFromChildren(children)) as T[],
    [children, treeData],
  );
  const flatRoots = useMemo<FlatTreeNode<T>[]>(
    () => buildFlatTree(data),
    [data],
  );
  const flatNodes = useMemo<FlatTreeNode<T>[]>(
    () => flattenTree(flatRoots),
    [flatRoots],
  );
  const allExpandableKeys = useMemo(
    () =>
      flatNodes
        .filter(
          (item) => item.children.length > 0 || item.node.isLeaf === false,
        )
        .map((item) => item.keyString),
    [flatNodes],
  );
  const expandedControlled = expandedKeys !== undefined;
  const selectedControlled = selectedKeys !== undefined;
  const checkedControlled = checkedKeys !== undefined;
  const [internalExpandedKeys, setInternalExpandedKeys] = useState(() =>
    defaultExpandAll ? allExpandableKeys : normalizeKeys(defaultExpandedKeys),
  );
  const [internalSelectedKeys, setInternalSelectedKeys] = useState(() =>
    normalizeKeys(defaultSelectedKeys),
  );
  const [internalCheckedKeys, setInternalCheckedKeys] = useState(() =>
    normalizeKeys(defaultCheckedKeys),
  );
  const [dragNodeKey, setDragNodeKey] = useState<string>();
  const currentExpandedKeys = expandedControlled
    ? normalizeKeys(expandedKeys)
    : internalExpandedKeys;
  const currentSelectedKeys = selectedControlled
    ? normalizeKeys(selectedKeys)
    : internalSelectedKeys;
  const currentCheckedKeys = checkedControlled
    ? normalizeKeys(checkedKeys)
    : internalCheckedKeys;
  const expandedKeySet = useMemo(
    () => new Set(currentExpandedKeys),
    [currentExpandedKeys],
  );
  const selectedKeySet = useMemo(
    () => new Set(currentSelectedKeys),
    [currentSelectedKeys],
  );
  const checkedKeySet = useMemo(
    () => new Set(currentCheckedKeys),
    [currentCheckedKeys],
  );

  function updateExpandedKeys(
    nextExpandedKeys: string[],
    item: FlatTreeNode<T>,
    nativeEvent: TreeExpandInfo<T>["nativeEvent"],
    expanded: boolean,
  ) {
    if (!expandedControlled) {
      setInternalExpandedKeys(nextExpandedKeys);
    }

    onExpand?.(nextExpandedKeys, {
      ...eventInfo(item, nativeEvent),
      expanded,
    });
  }

  function toggleExpand(
    item: FlatTreeNode<T>,
    nativeEvent: TreeExpandInfo<T>["nativeEvent"],
  ) {
    if (disabled || item.node.disabled || item.node.isLeaf) {
      return;
    }

    const expanded = !expandedKeySet.has(item.keyString);
    const nextExpandedKeys = expanded
      ? uniqueKeys([...currentExpandedKeys, item.keyString])
      : currentExpandedKeys.filter((key) => key !== item.keyString);

    updateExpandedKeys(nextExpandedKeys, item, nativeEvent, expanded);

    if (expanded && loadData) {
      void loadData(eventNode(item));
    }
  }

  function selectNode(
    item: FlatTreeNode<T>,
    nativeEvent: TreeSelectInfo<T>["nativeEvent"],
  ) {
    if (
      disabled ||
      item.node.disabled ||
      selectable === false ||
      item.node.selectable === false
    ) {
      return;
    }

    const selected = selectedKeySet.has(item.keyString);
    const nextSelectedKeys =
      selected && multiple
        ? currentSelectedKeys.filter((key) => key !== item.keyString)
        : selected
          ? currentSelectedKeys
          : multiple
            ? uniqueKeys([...currentSelectedKeys, item.keyString])
            : [item.keyString];

    if (!selectedControlled) {
      setInternalSelectedKeys(nextSelectedKeys);
    }

    onSelect?.(nextSelectedKeys, {
      ...eventInfo(item, nativeEvent),
      selected: !selected,
      selectedNodes: flatNodes
        .filter((node) => nextSelectedKeys.includes(node.keyString))
        .map((node) => node.node),
    });
  }

  function checkNode(
    item: FlatTreeNode<T>,
    nativeEvent: TreeCheckInfo<T>["nativeEvent"],
  ) {
    if (
      disabled ||
      item.node.disabled ||
      item.node.disableCheckbox ||
      checkable === false ||
      item.node.checkable === false
    ) {
      return;
    }

    const checked = checkedKeySet.has(item.keyString);
    const affectedKeys = [item.keyString, ...descendantKeys(item)];
    const nextCheckedKeys = checked
      ? currentCheckedKeys.filter((key) => !affectedKeys.includes(key))
      : uniqueKeys([...currentCheckedKeys, ...affectedKeys]);

    if (!checkedControlled) {
      setInternalCheckedKeys(nextCheckedKeys);
    }

    onCheck?.(nextCheckedKeys, {
      ...eventInfo(item, nativeEvent),
      checked: !checked,
      checkedNodes: checkedNodesFromKeys(flatNodes, nextCheckedKeys),
    });
  }

  function dragInfo(
    item: FlatTreeNode<T>,
    event: React.DragEvent<HTMLElement>,
  ): TreeDragInfo<T> {
    return {
      ...eventInfo(item, event),
      event,
    };
  }

  function handleDrop(
    item: FlatTreeNode<T>,
    event: React.DragEvent<HTMLElement>,
  ) {
    event.preventDefault();

    const dragNode = flatNodes.find((node) => node.keyString === dragNodeKey);
    const info: TreeDropInfo<T> = {
      ...dragInfo(item, event),
      dragNode: dragNode ? eventNode(dragNode) : undefined,
      dragNodesKeys: dragNode ? [dragNode.key] : [],
      dropPosition: 0,
      dropToGap: false,
    };

    onDrop?.(info);
  }

  function renderNode(item: FlatTreeNode<T>): React.ReactNode {
    const nodeDisabled = disabled || item.node.disabled;
    const expanded = expandedKeySet.has(item.keyString);
    const checked = checkedKeySet.has(item.keyString);
    const selected = selectedKeySet.has(item.keyString);
    const expandable = item.children.length > 0 || item.node.isLeaf === false;
    const nodeCheckable = checkable && item.node.checkable !== false;
    const nodeDraggable = Boolean(draggable && !nodeDisabled);
    const title = titleRender?.(item.node) ?? item.node.title ?? item.key;

    return (
      <li
        key={item.keyString}
        role="treeitem"
        aria-expanded={expandable ? expanded : undefined}
        aria-selected={selected}
        aria-disabled={nodeDisabled || undefined}
        tabIndex={nodeDisabled ? undefined : 0}
        onClick={(event) => {
          if (isCurrentTreeItemEvent(event)) {
            selectNode(item, event);
          }
        }}
        onKeyDown={(event) => {
          if (isActivationKey(event.key) && isCurrentTreeItemEvent(event)) {
            event.preventDefault();
            selectNode(item, event);
          }
        }}
        onDragStart={(event) => {
          setDragNodeKey(item.keyString);
          onDragStart?.(dragInfo(item, event));
        }}
        onDragEnter={(event) => onDragEnter?.(dragInfo(item, event))}
        onDragOver={(event) => {
          if (onDrop) {
            event.preventDefault();
          }

          onDragOver?.(dragInfo(item, event));
        }}
        onDragLeave={(event) => onDragLeave?.(dragInfo(item, event))}
        onDragEnd={(event) => onDragEnd?.(dragInfo(item, event))}
        onDrop={(event) => handleDrop(item, event)}
      >
        <div
          className={getTreeNodeClasses({
            selected,
            checked,
            disabled: nodeDisabled,
            expanded,
            draggable: nodeDraggable,
            className: cn(item.node.className, blockNode && "tree-node-block"),
          })}
          style={{ paddingInlineStart: item.level * 16 }}
          draggable={nodeDraggable}
        >
          <button
            type="button"
            aria-label={
              expanded
                ? `Collapse ${item.keyString}`
                : `Expand ${item.keyString}`
            }
            className={treeNodeSwitcherClass}
            disabled={nodeDisabled || !expandable}
            onClick={(event) => {
              event.stopPropagation();
              toggleExpand(item, event);
            }}
          >
            {expandable ? (expanded ? "v" : ">") : showLine ? "-" : ""}
          </button>
          {nodeCheckable ? (
            <input
              type="checkbox"
              className={treeNodeCheckboxClass}
              aria-label={`Check ${item.keyString}`}
              checked={checked}
              disabled={nodeDisabled || item.node.disableCheckbox}
              onChange={(event) => checkNode(item, event)}
              onClick={(event) => event.stopPropagation()}
            />
          ) : null}
          {showIcon && hasNode(item.node.icon) ? (
            <span className={treeNodeIconClass}>{item.node.icon}</span>
          ) : null}
          <span className={treeNodeTitleClass}>{title}</span>
        </div>
        {expanded && item.children.length > 0 ? (
          <ul className={treeNodeChildrenClass} role="group">
            {item.children.map(renderNode)}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div
      {...props}
      ref={ref}
      className={getTreeClasses({
        disabled,
        checkable,
        multiple,
        showLine,
        className,
      })}
      role="tree"
      aria-multiselectable={multiple || undefined}
    >
      <ul className={treeListClass}>{flatRoots.map(renderNode)}</ul>
    </div>
  );
}

const TreeBase = forwardRef(TreeRoot) as <
  T extends TreeDataNode = TreeDataNode,
>(
  props: TreeProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;

function DirectoryTreeRoot<T extends TreeDataNode>(
  { className, multiple = true, ...props }: DirectoryTreeProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <TreeBase
      {...props}
      ref={ref}
      multiple={multiple}
      className={cn("tree-directory", className)}
    />
  );
}

const DirectoryTree = forwardRef(DirectoryTreeRoot) as DirectoryTreeComponent;
const TreeNodeComponent = TreeNode as TreeNodeComponent;

export const Tree = TreeBase as TreeComponent;

Tree.TreeNode = TreeNodeComponent;
Tree.DirectoryTree = DirectoryTree;
Tree.displayName = "Tree";
