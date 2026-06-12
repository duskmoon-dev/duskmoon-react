import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type TreeSelectValue = string | number;
export type TreeSelectRawValue = TreeSelectValue | TreeSelectValue[];
export type TreeSelectCheckedStrategy =
  | "SHOW_ALL"
  | "SHOW_PARENT"
  | "SHOW_CHILD";

export interface TreeSelectDataNode {
  value?: TreeSelectValue;
  key?: TreeSelectValue;
  title?: ReactNode;
  label?: ReactNode;
  children?: TreeSelectDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  className?: string;
  [name: string]: unknown;
}

export interface TreeSelectNodeProps extends Omit<
  ComponentProps<"div">,
  "title" | "onSelect"
> {
  title?: ReactNode;
  value: TreeSelectValue;
  children?: ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
}

export interface TreeSelectChangeExtra<
  T extends TreeSelectDataNode = TreeSelectDataNode,
> {
  triggerValue?: TreeSelectValue;
  selected?: boolean;
  checked?: boolean;
  triggerNode?: T;
  allCheckedNodes?: T[];
}

export interface TreeSelectProps<
  T extends TreeSelectDataNode = TreeSelectDataNode,
> extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange" | "onSelect"
> {
  allowClear?: boolean;
  children?: ReactNode;
  defaultOpen?: boolean;
  defaultValue?: TreeSelectRawValue;
  defaultExpandedKeys?: TreeSelectValue[];
  defaultTreeExpandedKeys?: TreeSelectValue[];
  disabled?: boolean;
  expandedKeys?: TreeSelectValue[];
  filterTreeNode?: boolean | ((inputValue: string, node: T) => boolean);
  loadData?: (node: T) => Promise<unknown> | unknown;
  multiple?: boolean;
  onChange?: (
    value: TreeSelectRawValue | undefined,
    label: ReactNode | ReactNode[],
    extra: TreeSelectChangeExtra<T>,
  ) => void;
  onDropdownVisibleChange?: (open: boolean) => void;
  onSearch?: (value: string) => void;
  onSelect?: (
    value: TreeSelectValue,
    node: T,
    extra: TreeSelectChangeExtra<T>,
  ) => void;
  open?: boolean;
  placeholder?: ReactNode;
  searchValue?: string;
  showSearch?: boolean;
  treeCheckable?: boolean;
  treeCheckedStrategy?: TreeSelectCheckedStrategy;
  treeData?: T[];
  treeDefaultExpandAll?: boolean;
  treeExpandedKeys?: TreeSelectValue[];
  value?: TreeSelectRawValue;
}

export type TreeSelectNodeComponent = ForwardRefExoticComponent<
  TreeSelectNodeProps & RefAttributes<HTMLDivElement>
>;

export type TreeSelectComponent = (<
  T extends TreeSelectDataNode = TreeSelectDataNode,
>(
  props: TreeSelectProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & {
  TreeNode: TreeSelectNodeComponent;
  SHOW_ALL: "SHOW_ALL";
  SHOW_PARENT: "SHOW_PARENT";
  SHOW_CHILD: "SHOW_CHILD";
  displayName?: string;
};
