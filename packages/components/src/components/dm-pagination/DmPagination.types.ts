import type { CSSProperties } from "react";
import type {
  PaginationProps,
  PaginationShowTotal,
} from "../pagination/Pagination.types";
import type { DmPaginationAlign } from "../../classes/dm-pagination";

export interface DmPaginationLocale {
  refresh?: string;
  showTotal?: (
    total: number,
    range: [number, number],
    selectedTotal: number,
  ) => string;
  showTotalSimple?: (
    total: number,
    range: [number, number],
    selectedTotal: number,
  ) => string;
  selected?: (selectedTotal: number) => string;
}

export interface DmPaginationProps extends Omit<
  PaginationProps,
  "children" | "showTotal"
> {
  selectedTotal?: number;
  refresh?: () => void;
  showRefresh?: boolean;
  showPagination?: boolean;
  loading?: boolean;
  wrapperStyle?: CSSProperties;
  align?: DmPaginationAlign;
  showTotalFullMessage?: boolean;
  responsiveSimple?: boolean;
  locale?: DmPaginationLocale;
  showTotal?: PaginationShowTotal;
}
