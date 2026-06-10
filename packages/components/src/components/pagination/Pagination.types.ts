import type { ComponentProps, ReactNode } from "react";

export type PaginationSize = "sm" | "md" | "lg";

export type PaginationShowTotal = (
  total: number,
  range: [number, number],
) => ReactNode;

export interface PaginationProps extends Omit<
  ComponentProps<"nav">,
  "children" | "onChange"
> {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  total?: number;
  onChange?: (page: number, pageSize: number) => void;
  disabled?: boolean;
  simple?: boolean;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: PaginationShowTotal;
  size?: PaginationSize;
}
