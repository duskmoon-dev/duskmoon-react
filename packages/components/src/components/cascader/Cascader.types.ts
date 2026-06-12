import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type CascaderValue = string | number;
export type CascaderSingleValue = CascaderValue[];
export type CascaderMultipleValue = CascaderValue[][];
export type CascaderChangeValue = CascaderSingleValue | CascaderMultipleValue;
export type CascaderSize = "small" | "middle" | "large";
export type CascaderStatus = "error" | "warning";
export type CascaderExpandTrigger = "click" | "hover";
export type CascaderCheckedStrategy = "SHOW_PARENT" | "SHOW_CHILD";

export interface CascaderOption {
  label?: ReactNode;
  value?: CascaderValue;
  children?: CascaderOption[];
  disabled?: boolean;
  isLeaf?: boolean;
  loading?: boolean;
  className?: string;
  [key: string]: unknown;
}

export interface CascaderFieldNames {
  label?: string;
  value?: string;
  children?: string;
}

export interface CascaderSearchConfig {
  filter?: (
    inputValue: string,
    path: CascaderOption[],
    names: Required<CascaderFieldNames>,
  ) => boolean;
  render?: (
    inputValue: string,
    path: CascaderOption[],
    names: Required<CascaderFieldNames>,
  ) => ReactNode;
  limit?: number | false;
}

export interface CascaderProps extends Omit<
  ComponentProps<"div">,
  "children" | "defaultValue" | "onChange" | "onSelect"
> {
  allowClear?: boolean;
  changeOnSelect?: boolean;
  checkable?: boolean;
  checkedStrategy?: CascaderCheckedStrategy;
  children?: ReactNode;
  defaultOpen?: boolean;
  defaultValue?: CascaderChangeValue;
  disabled?: boolean;
  displayRender?: (
    labels: ReactNode[],
    selectedOptions?: CascaderOption[],
  ) => ReactNode;
  expandTrigger?: CascaderExpandTrigger;
  fieldNames?: CascaderFieldNames;
  loadData?: (selectedOptions: CascaderOption[]) => void;
  multiple?: boolean;
  notFoundContent?: ReactNode;
  onChange?: (
    value: CascaderChangeValue,
    selectedOptions?: CascaderOption[] | CascaderOption[][],
  ) => void;
  onDropdownVisibleChange?: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (value: string) => void;
  onSelect?: (
    value: CascaderSingleValue,
    selectedOptions?: CascaderOption[],
  ) => void;
  open?: boolean;
  options?: CascaderOption[];
  placeholder?: ReactNode;
  showSearch?: boolean | CascaderSearchConfig;
  size?: CascaderSize;
  status?: CascaderStatus;
  value?: CascaderChangeValue;
}

export type CascaderPanelProps = Omit<
  CascaderProps,
  "allowClear" | "defaultOpen" | "open" | "placeholder"
>;

export type CascaderComponent = ForwardRefExoticComponent<
  CascaderProps & RefAttributes<HTMLDivElement>
> & {
  Panel: ForwardRefExoticComponent<
    CascaderPanelProps & RefAttributes<HTMLDivElement>
  >;
  SHOW_PARENT: "SHOW_PARENT";
  SHOW_CHILD: "SHOW_CHILD";
};
