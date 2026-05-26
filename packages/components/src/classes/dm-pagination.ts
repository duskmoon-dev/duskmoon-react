import { cn } from "../utils";

export type DmPaginationAlign = "left" | "center" | "right";

export const dmPaginationBaseClass = "dm-pagination";
export const dmPaginationHiddenClass = "dm-pagination-hidden";
export const dmPaginationPagerClass = "dm-pagination-pager";
export const dmPaginationRefreshClass = "dm-pagination-refresh";
export const dmPaginationRefreshLoadingClass = "dm-pagination-refresh-loading";
export const dmPaginationSelectedClass = "dm-pagination-selected";

export const dmPaginationAlignClasses: Record<DmPaginationAlign, string> = {
  left: "dm-pagination-left",
  center: "dm-pagination-center",
  right: "dm-pagination-right",
};

export function getDmPaginationClasses({
  align = "right",
  hidden,
  className,
}: {
  align?: DmPaginationAlign;
  hidden?: boolean;
  className?: string;
}) {
  return cn(
    dmPaginationBaseClass,
    dmPaginationAlignClasses[align],
    hidden && dmPaginationHiddenClass,
    className,
  );
}

export function getDmPaginationRefreshClasses({
  loading,
  className,
}: {
  loading?: boolean;
  className?: string;
}) {
  return cn(
    dmPaginationRefreshClass,
    loading && dmPaginationRefreshLoadingClass,
    className,
  );
}
