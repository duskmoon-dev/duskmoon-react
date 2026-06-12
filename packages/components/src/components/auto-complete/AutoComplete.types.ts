import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type AutoCompleteSize = "sm" | "md" | "lg";

export interface AutoCompleteOptionType {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export type AutoCompleteFilterOption =
  | boolean
  | ((inputValue: string, option: AutoCompleteOptionType) => boolean);

export interface AutoCompleteProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange" | "onSelect"
> {
  allowClear?: boolean;
  children?: ReactNode;
  defaultOpen?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  filterOption?: AutoCompleteFilterOption;
  notFoundContent?: ReactNode;
  onChange?: (value: string, option?: AutoCompleteOptionType) => void;
  onSearch?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOptionType) => void;
  open?: boolean;
  options?: AutoCompleteOptionType[];
  placeholder?: string;
  size?: AutoCompleteSize;
  value?: string;
}

export interface AutoCompleteOptionProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  children?: ReactNode;
  disabled?: boolean;
  value: string;
}

export type AutoCompleteComponent = ForwardRefExoticComponent<
  AutoCompleteProps & RefAttributes<HTMLDivElement>
> & {
  Option: ForwardRefExoticComponent<
    AutoCompleteOptionProps & RefAttributes<HTMLDivElement>
  >;
};
