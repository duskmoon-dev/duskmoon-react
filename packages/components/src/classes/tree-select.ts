import { cn } from "../utils";

export const treeSelectContainerClass = "tree-select-container";
export const treeSelectBaseClass = "tree-select";
export const treeSelectOpenClass = "tree-select-open";
export const treeSelectDisabledClass = "tree-select-disabled";
export const treeSelectMultipleClass = "tree-select-multiple";
export const treeSelectSelectionClass =
  "tree-select-selection tree-select-value";
export const treeSelectPlaceholderClass = "tree-select-placeholder";
export const treeSelectTagClass = "tree-select-tag";
export const treeSelectClearClass = "tree-select-clear";
export const treeSelectIconClass = "tree-select-icon tree-select-arrow";
export const treeSelectDropdownClass = "tree-select-dropdown";
export const treeSelectSearchClass = "tree-select-search-input";
export const treeSelectListClass = "tree-select-list tree-select-options";
export const treeSelectEmptyClass = "tree-select-empty";
export const treeSelectNodeClass = "tree-select-node";
export const treeSelectNodeSelectedClass = "tree-select-node-selected";
export const treeSelectNodeCheckedClass = "tree-select-node-checked";
export const treeSelectNodeExpandedClass = "tree-select-node-expanded";
export const treeSelectNodeDisabledClass = "tree-select-node-disabled";
export const treeSelectSwitcherClass =
  "tree-select-switcher tree-select-node-toggle";
export const treeSelectCheckboxClass = "tree-select-checkbox";
export const treeSelectTitleClass = "tree-select-title tree-select-node-label";

export function getTreeSelectContainerClasses({
  open,
  disabled,
  multiple,
  className,
}: {
  open?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
}) {
  return cn(
    treeSelectContainerClass,
    treeSelectBaseClass,
    open && treeSelectOpenClass,
    disabled && treeSelectDisabledClass,
    multiple && treeSelectMultipleClass,
    className,
  );
}

export function getTreeSelectClasses({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    "tree-select-trigger",
    disabled && treeSelectDisabledClass,
    className,
  );
}

export function getTreeSelectNodeClasses({
  selected,
  checked,
  expanded,
  disabled,
  className,
}: {
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    treeSelectNodeClass,
    selected && treeSelectNodeSelectedClass,
    checked && treeSelectNodeCheckedClass,
    expanded && treeSelectNodeExpandedClass,
    disabled && treeSelectNodeDisabledClass,
    className,
  );
}
