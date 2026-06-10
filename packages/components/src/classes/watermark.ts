import { cn } from "../utils";

export const watermarkBaseClass = "watermark";
export const watermarkContentClass = "watermark-content";

export function getWatermarkClasses({ className }: { className?: string }) {
  return cn(watermarkBaseClass, className);
}
