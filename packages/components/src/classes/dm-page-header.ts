import { cn } from "../utils";

export const dmPageHeaderBaseClass = "dm-page-header";
export const dmPageHeaderMainClass = "dm-page-header-main";
export const dmPageHeaderBackClass = "dm-page-header-back";
export const dmPageHeaderDividerClass = "dm-page-header-divider";
export const dmPageHeaderContentClass = "dm-page-header-content";
export const dmPageHeaderTitleClass = "dm-page-header-title";
export const dmPageHeaderTitleListClass = "dm-page-header-title-list";
export const dmPageHeaderTitleItemClass = "dm-page-header-title-item";
export const dmPageHeaderExtraClass = "dm-page-header-extra";
export const dmPageHeaderBodyClass = "dm-page-header-body";
export const dmPageHeaderBreadcrumbClass = "dm-page-header-breadcrumb";

export function getDmPageHeaderClasses({
  hasExtra,
  className,
}: {
  hasExtra?: boolean;
  className?: string;
}) {
  return cn(
    dmPageHeaderBaseClass,
    hasExtra && "dm-page-header-has-extra",
    className,
  );
}
