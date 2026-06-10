import type {
  ChangeEvent,
  ComponentProps,
  ForwardRefExoticComponent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export type InputSize = "sm" | "md" | "lg";

export type InputStatus = "error" | "success";

export type InputVariant = "filled" | "outlined";

export type TextAreaResize = "none" | "both" | "horizontal" | "vertical";

export type InputChangeEvent = ChangeEvent<HTMLInputElement>;

export type TextAreaChangeEvent = ChangeEvent<HTMLTextAreaElement>;

export interface InputProps extends Omit<
  ComponentProps<"input">,
  "children" | "className" | "prefix" | "size" | "suffix" | "type"
> {
  allowClear?: boolean;
  className?: string;
  prefix?: ReactNode;
  size?: InputSize;
  status?: InputStatus;
  suffix?: ReactNode;
  type?: ComponentProps<"input">["type"];
  variant?: InputVariant;
  onChange?: (event: InputChangeEvent) => void;
}

export interface SearchProps extends Omit<InputProps, "suffix" | "type"> {
  enterButton?: ReactNode;
  loading?: boolean;
  onSearch?: (
    value: string,
    event?: KeyboardEvent<HTMLInputElement> | MouseEvent<HTMLElement>,
  ) => void;
}

export interface PasswordProps extends Omit<InputProps, "suffix" | "type"> {
  visibilityToggle?: boolean;
}

export interface TextAreaProps extends Omit<
  ComponentProps<"textarea">,
  "children" | "className" | "size"
> {
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  className?: string;
  showCount?: boolean;
  size?: InputSize;
  status?: InputStatus;
  variant?: InputVariant;
  resize?: TextAreaResize;
  onChange?: (event: TextAreaChangeEvent) => void;
}

export type InputGroupProps = ComponentProps<"div">;

export type InputComponent = ForwardRefExoticComponent<
  InputProps & RefAttributes<HTMLInputElement>
> & {
  Search: ForwardRefExoticComponent<
    SearchProps & RefAttributes<HTMLInputElement>
  >;
  Password: ForwardRefExoticComponent<
    PasswordProps & RefAttributes<HTMLInputElement>
  >;
  TextArea: ForwardRefExoticComponent<
    TextAreaProps & RefAttributes<HTMLTextAreaElement>
  >;
  Group: ForwardRefExoticComponent<
    InputGroupProps & RefAttributes<HTMLDivElement>
  >;
};
