import { cn } from "../utils";

export const affixBaseClass = "affix";
export const affixFixedClass = "affix-fixed";

export function getAffixClasses({
  fixed,
  className,
}: {
  fixed?: boolean;
  className?: string;
}) {
  return cn(affixBaseClass, fixed && affixFixedClass, className);
}
