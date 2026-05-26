import type { ComponentProps, ReactNode } from "react";

export type CollapseKey = string | number;

export type CollapseSize = "sm" | "md" | "lg";

export interface CollapseItem {
  key: CollapseKey;
  label: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface CollapseProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> {
  items?: CollapseItem[];
  activeKey?: CollapseKey | CollapseKey[];
  defaultActiveKey?: CollapseKey | CollapseKey[];
  onChange?: (key: CollapseKey | CollapseKey[]) => void;
  accordion?: boolean;
  bordered?: boolean;
  ghost?: boolean;
  size?: CollapseSize;
  children?: ReactNode;
}
