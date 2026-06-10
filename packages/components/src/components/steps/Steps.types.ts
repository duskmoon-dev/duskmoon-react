import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  Key,
  ReactNode,
  RefAttributes,
} from "react";

export type StepsDirection = "horizontal" | "vertical";

export type StepsStatus = "wait" | "process" | "finish" | "error";

export interface StepsProgressDotInfo {
  index: number;
  status: StepsStatus;
  title?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
}

export type StepsProgressDotRender = (
  iconDot: ReactNode,
  info: StepsProgressDotInfo,
) => ReactNode;

export interface StepItem {
  key?: Key;
  title?: ReactNode;
  subTitle?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  status?: StepsStatus;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface StepProps extends Omit<
  ComponentProps<"div">,
  "children" | "content" | "title"
> {
  title?: ReactNode;
  subTitle?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  status?: StepsStatus;
  disabled?: boolean;
}

export interface StepsProps extends Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> {
  items?: StepItem[];
  current?: number;
  status?: StepsStatus;
  direction?: StepsDirection;
  progressDot?: boolean | StepsProgressDotRender;
  percent?: number;
  initial?: number;
  onChange?: (current: number) => void;
  children?: ReactNode;
}

export type StepComponent = ForwardRefExoticComponent<
  StepProps & RefAttributes<HTMLDivElement>
>;

export type StepsComponent = ForwardRefExoticComponent<
  StepsProps & RefAttributes<HTMLDivElement>
> & {
  Step: StepComponent;
};
