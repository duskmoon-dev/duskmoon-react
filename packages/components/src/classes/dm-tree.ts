import { cn } from "../utils";

export const dmTreeBaseClass = "dm-tree";
export const dmTreeAutoWidthClass = "dm-tree-auto-width";
export const dmTreeContentClass = "dm-tree-content";
export const dmTreeToolbarClass = "dm-tree-toolbar";
export const dmTreeIconToolbarClass = "dm-tree-icon-toolbar";
export const dmTreeAllButtonClass = "dm-tree-all-button";
export const dmTreeAllButtonSelectedClass = "dm-tree-all-button-selected";
export const dmTreeSearchClass = "dm-tree-search";
export const dmTreeBodyClass = "dm-tree-body";
export const dmTreeNodeTitleClass = "dm-tree-node-title";
export const dmTreeNodePrefixClass = "dm-tree-node-prefix";
export const dmTreeItemToolbarClass = "dm-tree-item-toolbar";
export const dmTreeItemToolbarVisibleClass = "dm-tree-item-toolbar-visible";
export const dmTreeOptionClass = "dm-tree-option";

export function getDmTreeClasses({
  autoWidth,
  optionTree,
  className,
}: {
  autoWidth?: boolean;
  optionTree?: boolean;
  className?: string;
}) {
  return cn(
    dmTreeBaseClass,
    autoWidth && dmTreeAutoWidthClass,
    optionTree && dmTreeOptionClass,
    className,
  );
}

export function getDmTreeAllButtonClasses({
  selected,
  className,
}: {
  selected?: boolean;
  className?: string;
}) {
  return cn(
    dmTreeAllButtonClass,
    selected && dmTreeAllButtonSelectedClass,
    className,
  );
}

export function getDmTreeItemToolbarClasses({
  alwaysShow,
  className,
}: {
  alwaysShow?: boolean;
  className?: string;
}) {
  return cn(
    dmTreeItemToolbarClass,
    alwaysShow && dmTreeItemToolbarVisibleClass,
    className,
  );
}
