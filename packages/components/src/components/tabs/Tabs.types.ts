import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from "react";

export type TabsKey = string;

export type TabsPosition = "top" | "right" | "bottom" | "left";

export type TabsType = "line" | "card" | "editable-card";

export type TabsSize = "small" | "middle" | "large" | "sm" | "md" | "lg";

export type TabsEditAction = "add" | "remove";

export type TabsEditEvent =
  | MouseEvent<HTMLElement>
  | KeyboardEvent<HTMLElement>;

export type TabsOnEdit = (
  targetKey: TabsKey | TabsEditEvent,
  action: TabsEditAction,
) => void;

export interface TabsItem {
  key: TabsKey;
  label?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  closeIcon?: ReactNode;
  forceRender?: boolean;
  destroyInactiveTabPane?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface TabPaneProps extends Omit<ComponentProps<"div">, "tab"> {
  tab?: ReactNode;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  closeIcon?: ReactNode;
  forceRender?: boolean;
  children?: ReactNode;
}

export interface TabsProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> {
  items?: TabsItem[];
  activeKey?: TabsKey;
  defaultActiveKey?: TabsKey;
  onChange?: (activeKey: TabsKey) => void;
  onTabClick?: (activeKey: TabsKey, event: MouseEvent<HTMLElement>) => void;
  tabPosition?: TabsPosition;
  type?: TabsType;
  size?: TabsSize;
  hideAdd?: boolean;
  addIcon?: ReactNode;
  removeIcon?: ReactNode;
  onEdit?: TabsOnEdit;
  destroyInactiveTabPane?: boolean;
  centered?: boolean;
  children?: ReactNode;
}
