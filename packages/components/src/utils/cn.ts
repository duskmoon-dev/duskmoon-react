import { clsx, type ClassValue } from "clsx";

/**
 * A simple wrapper around clsx for conditional class merging.
 *
 * In Phase 1, we use clsx directly.
 * In Phase 2, this will be wrapped with duskmoonMerge() to handle duskmoonui conflict families.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Placeholder for duskmoonMerge.
 * This will eventually handle conflict resolution for duskmoonui specific classes.
 */
export function duskmoonMerge(classes: string): string {
  // TODO: Implement duskmoonui-aware conflict resolution
  return classes;
}
