import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import type { TooltipProps } from "../tooltip/Tooltip.types";

export interface DmTruncateProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "onCopy"> {
  children?: ReactNode;
  showOverflowTag?: boolean;
  overflowContent?: ReactNode | ((value: string) => ReactNode);
  emptyValue?: ReactNode;
  overflowPercent?: number;
  tooltipProps?: Partial<TooltipProps>;
  isShowPopover?: boolean;
  copyable?: boolean;
  maxLines?: number;
  tooltipPreserveLineBreak?: boolean;
  textClassName?: string;
  textStyle?: CSSProperties;
  onCopy?: (value: string) => void;
}

