import type {
  ComponentProps,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from "react";
import type { ButtonProps } from "../button/Button.types";

export type TourPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";

export type TourTarget =
  | HTMLElement
  | null
  | string
  | (() => HTMLElement | null);

export interface TourMaskConfig {
  className?: string;
  style?: CSSProperties;
  color?: string;
}

export interface TourStep {
  title?: ReactNode;
  description?: ReactNode;
  target?: TourTarget;
  placement?: TourPlacement;
  cover?: ReactNode;
  mask?: boolean | TourMaskConfig;
  nextButtonProps?: ButtonProps;
  prevButtonProps?: ButtonProps;
  closeIcon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClose?: (current: number) => void;
}

export interface TourProps extends Omit<
  ComponentProps<"div">,
  "children" | "title" | "onChange"
> {
  steps?: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  current?: number;
  defaultCurrent?: number;
  placement?: TourPlacement;
  mask?: boolean | TourMaskConfig;
  indicators?: boolean | ((current: number, total: number) => ReactNode);
  indicatorsRender?: (current: number, total: number) => ReactNode;
  closeIcon?: ReactNode;
  disabledInteraction?: boolean;
  zIndex?: number;
  gap?: number;
  nextButtonProps?: ButtonProps;
  prevButtonProps?: ButtonProps;
  onClose?: (current: number) => void;
  onChange?: (current: number) => void;
  onFinish?: () => void;
}

export interface TourTargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type TourActionEvent = MouseEvent<HTMLButtonElement>;
