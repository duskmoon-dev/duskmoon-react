import { cn } from "../utils";
import type { SpinSize } from "../components/spin/Spin.types";

export const spinBaseClass = "spin";
export const spinSpinningClass = "spin-spinning";
export const spinNestedLoadingClass = "spin-nested-loading";
export const spinContainerClass = "spin-container";
export const spinBlurClass = "spin-blur";
export const spinDotClass = "spin-dot";
export const spinTipClass = "spin-tip";
export const spinFullscreenClass = "spin-fullscreen";

export const spinSizeClasses: Record<SpinSize, string> = {
  small: "spin-sm progress-circular-sm",
  default: "spin-md progress-circular-md",
  large: "spin-lg progress-circular-lg",
};

export function getSpinClasses({
  spinning,
  size = "default",
  fullscreen,
  className,
}: {
  spinning?: boolean;
  size?: SpinSize;
  fullscreen?: boolean;
  className?: string;
}) {
  return cn(
    spinBaseClass,
    "progress-circular progress-circular-indeterminate",
    spinSizeClasses[size],
    spinning && spinSpinningClass,
    fullscreen && spinFullscreenClass,
    className,
  );
}
