import { cn } from "../utils";

export const dmDrawerBaseClass = "dm-drawer";
export const dmDrawerFooterActionClass = "dm-drawer-footer-action";

export function getDmDrawerClasses({
  className,
}: {
  className?: string;
}) {
  return cn(dmDrawerBaseClass, className);
}

export function getDmDrawerFooterClasses({
  align = "right",
  className,
}: {
  align?: "left" | "center" | "right";
  className?: string;
}) {
  return cn(
    "dm-drawer-footer",
    align === "left" && "dm-drawer-footer-left",
    align === "center" && "dm-drawer-footer-center",
    align === "right" && "dm-drawer-footer-right",
    className,
  );
}
