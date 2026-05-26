import type { ComponentProps, CSSProperties, ReactNode } from "react";

export type StatisticValue = string | number;

export interface StatisticProps extends Omit<
  ComponentProps<"div">,
  "prefix" | "title"
> {
  title?: ReactNode;
  value?: StatisticValue;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: StatisticValue | undefined) => ReactNode;
  valueStyle?: CSSProperties;
}

export type CountdownValue = number | string | Date;

export interface CountdownProps extends Omit<
  StatisticProps,
  "value" | "formatter" | "precision" | "onChange"
> {
  value: CountdownValue;
  format?: string;
  onFinish?: () => void;
  onChange?: (value: number) => void;
}

export interface StatisticComponent {
  (props: StatisticProps): ReactNode;
  Countdown: (props: CountdownProps) => ReactNode;
}
