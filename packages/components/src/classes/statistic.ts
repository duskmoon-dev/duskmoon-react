import { cn } from "../utils";

export const statisticBaseClass = "statistic";
export const statisticTitleClass = "statistic-title";
export const statisticContentClass = "statistic-content";
export const statisticPrefixClass = "statistic-prefix";
export const statisticValueClass = "statistic-value";
export const statisticSuffixClass = "statistic-suffix";

export function getStatisticClasses({ className }: { className?: string }) {
  return cn(statisticBaseClass, className);
}
