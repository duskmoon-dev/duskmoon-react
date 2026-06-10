import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type SelectValue = string | number;
export type SelectMode = "multiple" | "tags";
export type SelectSize = "sm" | "md" | "lg";
export type SelectStatus = "error" | "success";

export interface SelectOptionType {
  label?: ReactNode;
  value: SelectValue;
  disabled?: boolean;
  className?: string;
}

export interface SelectOptGroupType {
  label?: ReactNode;
  options: SelectOptionType[];
  className?: string;
}

export type SelectOptionInput = SelectOptionType | SelectOptGroupType;

export type SelectChangeValue = SelectValue | SelectValue[] | undefined;

export interface SelectProps
  extends Omit<
    ComponentProps<"div">,
    "children" | "defaultValue" | "onChange"
  > {
  allowClear?: boolean;
  children?: ReactNode;
  defaultValue?: SelectChangeValue;
  disabled?: boolean;
  filterOption?:
    | boolean
    | ((inputValue: string, option: SelectOptionType) => boolean);
  loading?: boolean;
  mode?: SelectMode;
  onChange?: (
    value: SelectChangeValue,
    option?: SelectOptionType | SelectOptionType[],
  ) => void;
  options?: SelectOptionInput[];
  placeholder?: ReactNode;
  showSearch?: boolean;
  size?: SelectSize;
  status?: SelectStatus;
  value?: SelectChangeValue;
}

export interface SelectOptionProps
  extends Omit<ComponentProps<"div">, "children"> {
  children?: ReactNode;
  disabled?: boolean;
  value: SelectValue;
}

export interface SelectOptGroupProps
  extends Omit<ComponentProps<"div">, "children"> {
  children?: ReactNode;
  label?: ReactNode;
}

export type SelectComponent = ForwardRefExoticComponent<
  SelectProps & RefAttributes<HTMLDivElement>
> & {
  Option: ForwardRefExoticComponent<
    SelectOptionProps & RefAttributes<HTMLDivElement>
  >;
  OptGroup: ForwardRefExoticComponent<
    SelectOptGroupProps & RefAttributes<HTMLDivElement>
  >;
};
