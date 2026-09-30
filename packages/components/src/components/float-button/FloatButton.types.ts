import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  MouseEventHandler,
  ReactNode,
  RefAttributes,
} from "react";

export type FloatButtonType = "default" | "primary";
export type FloatButtonShape = "circle" | "square";
export type FloatButtonGroupTrigger = "click" | "hover";
export type FloatButtonTooltipPlacement = "top" | "bottom" | "left" | "right";

export interface FloatButtonTooltipConfig {
  title?: ReactNode;
  placement?: FloatButtonTooltipPlacement;
}

export type FloatButtonTooltip = ReactNode | FloatButtonTooltipConfig;

export interface FloatButtonBadge {
  count?: ReactNode;
  dot?: boolean;
  color?: string;
  overflowCount?: number;
}

export interface FloatButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onClick" | "type"
> {
  icon?: ReactNode;
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  tooltip?: FloatButtonTooltip;
  description?: ReactNode;
  badge?: FloatButtonBadge;
  href?: string;
  target?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
}

export interface FloatButtonGroupProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onClick"
> {
  shape?: FloatButtonShape;
  trigger?: FloatButtonGroupTrigger;
  open?: boolean;
  closeIcon?: ReactNode;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
}

export interface FloatButtonBackTopProps extends Omit<
  FloatButtonProps,
  "href" | "target"
> {
  visibilityHeight?: number;
  target?: () => Window | HTMLElement | null;
}

export type FloatButtonComponent = ForwardRefExoticComponent<
  FloatButtonProps & RefAttributes<HTMLButtonElement | HTMLAnchorElement>
> & {
  Group: ForwardRefExoticComponent<
    FloatButtonGroupProps & RefAttributes<HTMLDivElement>
  >;
  BackTop: ForwardRefExoticComponent<
    FloatButtonBackTopProps & RefAttributes<HTMLButtonElement>
  >;
};
