import type { DmStatusType } from "../components/dm-status/DmStatus.types";
import { cn } from "../utils";

export const dmStatusBaseClass = "dm-status";
export const dmStatusLoadingClass = "dm-status-loading";
export const dmStatusContentClass = "dm-status-content";
export const dmStatusImageClass = "dm-status-image";

export const dmStatusTypeClasses: Record<DmStatusType, string> = {
  empty: "dm-status-empty",
  loading: "dm-status-loading-state",
  error: "dm-status-error",
  success: "dm-status-success",
};

export function getDmStatusClasses({
  status,
  className,
}: {
  status: DmStatusType;
  className?: string;
}) {
  return cn(dmStatusBaseClass, dmStatusTypeClasses[status], className);
}

