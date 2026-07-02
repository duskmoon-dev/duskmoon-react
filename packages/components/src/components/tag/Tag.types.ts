import type {
  ComponentProps,
  ForwardRefExoticComponent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export type TagColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";

export type TagType = TagColor | (string & {});

export interface TagProps extends Omit<ComponentProps<"span">, "color"> {
  color?: TagType;
  icon?: ReactNode;
  closable?: boolean;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  closeIcon?: ReactNode;
  bordered?: boolean;
}

export interface CheckableTagProps extends Omit<
  ComponentProps<"span">,
  "color" | "onChange"
> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export type CheckableTagComponent = ForwardRefExoticComponent<
  CheckableTagProps & RefAttributes<HTMLSpanElement>
>;

export type TagComponent = ForwardRefExoticComponent<
  TagProps & RefAttributes<HTMLSpanElement>
> & {
  CheckableTag: CheckableTagComponent;
};
