import type {
  ComponentProps,
  ChangeEvent,
  DragEvent,
  ForwardRefExoticComponent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type TreeKey = string | number;

export interface TreeDataNode {
  key: TreeKey;
  title?: ReactNode;
  children?: TreeDataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  icon?: ReactNode;
  isLeaf?: boolean;
  className?: string;
  [name: string]: unknown;
}

export interface EventDataNode<
  T extends TreeDataNode = TreeDataNode,
> extends TreeDataNode {
  key: TreeKey;
  pos: string;
  data: T;
}

export interface TreeEventInfo<T extends TreeDataNode = TreeDataNode> {
  node: EventDataNode<T>;
  nativeEvent:
    | MouseEvent<HTMLElement>
    | KeyboardEvent<HTMLElement>
    | ChangeEvent<HTMLElement>
    | DragEvent<HTMLElement>;
}

export interface TreeExpandInfo<
  T extends TreeDataNode = TreeDataNode,
> extends TreeEventInfo<T> {
  expanded: boolean;
}

export interface TreeSelectInfo<
  T extends TreeDataNode = TreeDataNode,
> extends TreeEventInfo<T> {
  selected: boolean;
  selectedNodes: T[];
}

export interface TreeCheckInfo<
  T extends TreeDataNode = TreeDataNode,
> extends TreeEventInfo<T> {
  checked: boolean;
  checkedNodes: T[];
}

export interface TreeDragInfo<
  T extends TreeDataNode = TreeDataNode,
> extends TreeEventInfo<T> {
  event: React.DragEvent<HTMLElement>;
}

export interface TreeDropInfo<
  T extends TreeDataNode = TreeDataNode,
> extends TreeDragInfo<T> {
  dragNode?: EventDataNode<T>;
  dragNodesKeys: TreeKey[];
  dropPosition: number;
  dropToGap: boolean;
}

export interface TreeNodeProps extends Omit<
  ComponentProps<"div">,
  "title" | "onSelect"
> {
  title?: ReactNode;
  eventKey?: TreeKey;
  children?: ReactNode;
  disabled?: boolean;
  disableCheckbox?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  icon?: ReactNode;
  isLeaf?: boolean;
}

export interface TreeProps<T extends TreeDataNode = TreeDataNode> extends Omit<
  ComponentProps<"div">,
  | "onChange"
  | "onSelect"
  | "onDragStart"
  | "onDragEnter"
  | "onDragOver"
  | "onDragLeave"
  | "onDragEnd"
  | "onDrop"
> {
  treeData?: T[];
  expandedKeys?: TreeKey[];
  defaultExpandedKeys?: TreeKey[];
  selectedKeys?: TreeKey[];
  defaultSelectedKeys?: TreeKey[];
  checkedKeys?: TreeKey[];
  defaultCheckedKeys?: TreeKey[];
  checkable?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  draggable?: boolean;
  blockNode?: boolean;
  defaultExpandAll?: boolean;
  loadData?: (node: EventDataNode<T>) => Promise<unknown> | unknown;
  titleRender?: (node: T) => ReactNode;
  onExpand?: (expandedKeys: TreeKey[], info: TreeExpandInfo<T>) => void;
  onSelect?: (selectedKeys: TreeKey[], info: TreeSelectInfo<T>) => void;
  onCheck?: (checkedKeys: TreeKey[], info: TreeCheckInfo<T>) => void;
  onDragStart?: (info: TreeDragInfo<T>) => void;
  onDragEnter?: (info: TreeDragInfo<T>) => void;
  onDragOver?: (info: TreeDragInfo<T>) => void;
  onDragLeave?: (info: TreeDragInfo<T>) => void;
  onDragEnd?: (info: TreeDragInfo<T>) => void;
  onDrop?: (info: TreeDropInfo<T>) => void;
}

export type DirectoryTreeProps<T extends TreeDataNode = TreeDataNode> =
  TreeProps<T>;

export type TreeNodeComponent = ForwardRefExoticComponent<
  TreeNodeProps & RefAttributes<HTMLDivElement>
>;

export type DirectoryTreeComponent = <T extends TreeDataNode = TreeDataNode>(
  props: DirectoryTreeProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export type TreeComponent = (<T extends TreeDataNode = TreeDataNode>(
  props: TreeProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & {
  TreeNode: TreeNodeComponent;
  DirectoryTree: DirectoryTreeComponent;
  displayName?: string;
};
