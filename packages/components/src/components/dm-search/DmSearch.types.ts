import type { ReactNode, RefAttributes } from "react";
import type { InputProps } from "../input/Input.types";
import type { SelectProps } from "../select/Select.types";
import type {
  DatePickerProps,
  RangePickerProps,
} from "../date-picker/DatePicker.types";

export type DmSearchItemType =
  | "input"
  | "input-number"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "dateRange"
  | "custom";

export interface DmSearchItem {
  key: string;
  title: ReactNode;
  dataIndex: string;
  search: {
    type: DmSearchItemType;
    extraProps?: Record<string, unknown>;
    formProps?: {
      initialValue?: unknown;
      rules?: unknown[];
    };
    render?: (
      value: unknown,
      setValue: (value: unknown) => void,
      item: DmSearchItem,
    ) => ReactNode;
  };
}

export interface DmSearchRef {
  onReset: () => void;
}

export interface DmSearchProps extends RefAttributes<DmSearchRef> {
  items?: DmSearchItem[];
  onSearch?: (values: Record<string, unknown>) => void;
  extra?: ReactNode;
  fastFilterItem?: DmSearchItem;
  defaultCollapsed?: boolean;
  hideCollapseBtn?: boolean;
  compact?: boolean;
  searchParams?: Record<string, unknown>;
  loading?: boolean;
  enableDefaultPlaceHolder?: boolean;
  className?: string;
  inputProps?: Partial<InputProps>;
  selectProps?: Partial<SelectProps>;
  datePickerProps?: Partial<DatePickerProps & RangePickerProps>;
}
