import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type CalendarMode = "month" | "year";
export type CalendarValue = string | Date;
export type CalendarSelectSource = "date" | "month" | "year" | "customize";

export interface CalendarInfo {
  originNode: ReactNode;
  today: string;
  range?: "start" | "end";
  type: CalendarMode;
}

export interface CalendarSelectInfo {
  source: CalendarSelectSource;
}

export interface CalendarHeaderRenderProps {
  value: string;
  type: CalendarMode;
  onChange: (value: CalendarValue) => void;
  onTypeChange: (type: CalendarMode) => void;
}

export interface CalendarProps extends Omit<
  ComponentProps<"div">,
  "defaultValue" | "onChange" | "onSelect"
> {
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  mode?: CalendarMode;
  defaultMode?: CalendarMode;
  fullscreen?: boolean;
  validRange?: [CalendarValue, CalendarValue];
  disabledDate?: (date: string) => boolean;
  dateCellRender?: (date: string) => ReactNode;
  dateFullCellRender?: (date: string) => ReactNode;
  monthCellRender?: (date: string) => ReactNode;
  monthFullCellRender?: (date: string) => ReactNode;
  cellRender?: (current: string, info: CalendarInfo) => ReactNode;
  fullCellRender?: (current: string, info: CalendarInfo) => ReactNode;
  headerRender?: (props: CalendarHeaderRenderProps) => ReactNode;
  onChange?: (date: string) => void;
  onSelect?: (date: string, selectInfo: CalendarSelectInfo) => void;
  onPanelChange?: (date: string, mode: CalendarMode) => void;
}

export type CalendarComponent = ForwardRefExoticComponent<
  CalendarProps & RefAttributes<HTMLDivElement>
>;
