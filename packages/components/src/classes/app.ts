import { cn } from "../utils";

export const appClass = "app";
export const appRootClass = "app-root";
export const appHolderClass = "app-holder";

export function getAppClasses({
  className,
}: {
  className?: string;
}) {
  return cn(appClass, className);
}

export function getAppRootClasses({
  className,
}: {
  className?: string;
}) {
  return cn(appRootClass, className);
}
