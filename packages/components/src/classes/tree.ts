import { cn } from "../utils";

export const treeBaseClass = "tree";
export const treeDirectoryClass = "tree-directory";
export const treeDisabledClass = "tree-disabled";
export const treeShowLineClass = "tree-show-line";
export const treeCheckableClass = "tree-checkable";
export const treeMultipleClass = "tree-multiple";
export const treeListClass = "tree-list";
export const treeNodeClass = "tree-node";
export const treeNodeSelectedClass = "tree-node-selected";
export const treeNodeCheckedClass = "tree-node-checked";
export const treeNodeDisabledClass = "tree-node-disabled";
export const treeNodeExpandedClass = "tree-node-expanded";
export const treeNodeDraggableClass = "tree-node-draggable";
export const treeNodeSwitcherClass = "tree-node-switcher";
export const treeNodeCheckboxClass = "tree-node-checkbox";
export const treeNodeIconClass = "tree-node-icon";
export const treeNodeTitleClass = "tree-node-title";
export const treeNodeChildrenClass = "tree-node-children";

export function getTreeClasses({
  disabled,
  checkable,
  multiple,
  showLine,
  directory,
  className,
}: {
  disabled?: boolean;
  checkable?: boolean;
  multiple?: boolean;
  showLine?: boolean;
  directory?: boolean;
  className?: string;
}) {
  return cn(
    treeBaseClass,
    disabled && treeDisabledClass,
    checkable && treeCheckableClass,
    multiple && treeMultipleClass,
    showLine && treeShowLineClass,
    directory && treeDirectoryClass,
    className,
  );
}

export function getTreeNodeClasses({
  selected,
  checked,
  disabled,
  expanded,
  draggable,
  className,
}: {
  selected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  draggable?: boolean;
  className?: string;
}) {
  return cn(
    treeNodeClass,
    selected && treeNodeSelectedClass,
    checked && treeNodeCheckedClass,
    disabled && treeNodeDisabledClass,
    expanded && treeNodeExpandedClass,
    draggable && treeNodeDraggableClass,
    className,
  );
}
