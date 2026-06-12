import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { TreeDataNode, TreeKey, TreeProps } from "../tree/Tree.types";
import type { DmTabsItem } from "../dm-tabs/DmTabs.types";

export type DmTreeDataNode = Record<string, unknown> & {
  key?: TreeKey;
  title?: ReactNode;
  children?: readonly DmTreeDataNode[];
};

export interface DmTreeFieldNames<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> {
  title?: keyof TDataNode | string;
  key?: keyof TDataNode | string;
  children?: keyof TDataNode | string;
}

export interface DmTreeToolbarButton<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> {
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: (
    selectedKey: TreeKey | undefined,
    getSelectedItem: () => TDataNode | undefined,
  ) => void;
}

export interface DmTreeItemAction<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> {
  icon: ReactNode;
  title?: string;
  disabled?: boolean | ((item: TDataNode) => boolean);
  show?: boolean | ((item: TDataNode) => boolean);
  onClick?: (item: TDataNode) => void;
}

export interface DmTreeAllItem {
  value: TreeKey;
  label: ReactNode;
}

export interface DmTreeCommonProps<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> extends Omit<
  TreeProps<TreeDataNode>,
  "treeData" | "children" | "onChange" | "onSelect" | "titleRender"
> {
  treeData: TDataNode[];
  selectedKey?: TreeKey;
  showAll?: boolean;
  allItem?: DmTreeAllItem;
  buttonTopToolbar?:
    | DmTreeToolbarButton<TDataNode>[]
    | ((
        selectedKey: TreeKey | undefined,
        getSelectedItem: () => TDataNode | undefined,
      ) => ReactNode);
  iconTopToolbar?:
    | DmTreeToolbarButton<TDataNode>[]
    | ((
        selectedKey: TreeKey | undefined,
        getSelectedItem: () => TDataNode | undefined,
      ) => ReactNode);
  customTopToolbar?: ReactNode;
  itemToolbar?:
    | DmTreeItemAction<TDataNode>[]
    | ((item: TDataNode) => ReactNode);
  itemToolbarAlwaysShow?: boolean;
  beforeSelect?: (
    selectItem: TDataNode,
    selectedKey: TreeKey,
    beforeSelectKey: TreeKey | undefined,
  ) => boolean | Promise<boolean> | void;
  onChange?: (
    selectItem: TDataNode | undefined,
    selectKey: TreeKey | undefined,
    beforeSelectKey: TreeKey | undefined,
  ) => void;
  loading?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  customSearch?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  beforeIcon?: ReactNode | ((item: TDataNode) => ReactNode);
  emptyNode?: ReactNode;
  width?: number | string;
  minNodeWidth?: number | string;
  fieldNames?: DmTreeFieldNames<TDataNode>;
}

export interface DmTreeOptionItem<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> extends Omit<DmTabsItem, "children"> {
  loading?: boolean;
  TreeSetting: DmTreeCommonProps<TDataNode>;
}

export interface DmTreeOptionProps<
  TDataNode extends DmTreeDataNode = TreeDataNode,
> extends Omit<ComponentProps<"div">, "onChange"> {
  isTabTree: true;
  items: DmTreeOptionItem<TDataNode>[];
  defaultActiveKey?: string;
  activeKey?: string;
  clearOtherSelection?: boolean;
  width?: number | string;
  minNodeWidth?: number | string;
  onChange?: (activeKey: string) => void;
}

export type DmTreeProps<TDataNode extends DmTreeDataNode = TreeDataNode> =
  | (DmTreeCommonProps<TDataNode> & { isTabTree?: false })
  | DmTreeOptionProps<TDataNode>;

export type DmTreeComponent = <TDataNode extends DmTreeDataNode = TreeDataNode>(
  props: DmTreeProps<TDataNode>,
) => ReactElement | null;
