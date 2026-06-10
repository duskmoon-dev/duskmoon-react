import { cn } from "../utils";
import type {
  FloatButtonShape,
  FloatButtonType,
} from "../components/float-button/FloatButton.types";

export const floatButtonBaseClass = "float-button";
export const floatButtonIconClass = "float-button-icon";
export const floatButtonDescriptionClass = "float-button-description";
export const floatButtonBadgeClass = "float-button-badge";
export const floatButtonTooltipClass = "float-button-tooltip";
export const floatButtonGroupClass = "float-button-group";
export const floatButtonGroupOpenClass = "float-button-group-open";
export const floatButtonBackTopClass = "float-button-back-top";
export const floatButtonBackTopVisibleClass = "float-button-back-top-visible";

export const floatButtonTypeClasses: Record<FloatButtonType, string> = {
  default: "btn btn-secondary btn-tonal",
  primary: "btn btn-primary",
};

export const floatButtonShapeClasses: Record<FloatButtonShape, string> = {
  circle: "btn-circle rounded-full",
  square: "btn-square rounded-lg",
};

export function getFloatButtonClasses({
  type = "default",
  shape = "circle",
  hasDescription,
  className,
}: {
  type?: FloatButtonType;
  shape?: FloatButtonShape;
  hasDescription?: boolean;
  className?: string;
}) {
  return cn(
    floatButtonBaseClass,
    "relative inline-flex items-center justify-center gap-1 shadow-lg",
    floatButtonTypeClasses[type],
    floatButtonShapeClasses[shape],
    hasDescription && "min-w-20 px-3",
    className,
  );
}

export function getFloatButtonGroupClasses({
  shape = "circle",
  open = true,
  className,
}: {
  shape?: FloatButtonShape;
  open?: boolean;
  className?: string;
}) {
  return cn(
    floatButtonGroupClass,
    "fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3",
    shape === "square" && "items-stretch",
    open && floatButtonGroupOpenClass,
    className,
  );
}

export function getFloatButtonBackTopClasses({
  visible,
  className,
}: {
  visible?: boolean;
  className?: string;
}) {
  return cn(
    floatButtonBackTopClass,
    visible && floatButtonBackTopVisibleClass,
    className,
  );
}
