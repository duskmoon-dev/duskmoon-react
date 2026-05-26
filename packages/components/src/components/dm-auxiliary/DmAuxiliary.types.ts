import type { ComponentProps, ReactNode } from "react";

export interface DmAuxiliaryAction {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DmAuxiliaryProps
  extends Omit<ComponentProps<"div">, "content" | "children"> {
  content?: string;
  children?: ReactNode;
  hideClose?: boolean;
  icon?: ReactNode;
  actions?: DmAuxiliaryAction[];
  extra?: ReactNode;
  onClose?: () => void;
}

