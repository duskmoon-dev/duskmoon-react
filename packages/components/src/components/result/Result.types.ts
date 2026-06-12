import type { ComponentProps, ReactNode } from "react";

export type ResultNormalizedStatus =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "404"
  | "403"
  | "500";

export type ResultStatus = ResultNormalizedStatus | 404 | 403 | 500;

export interface ResultProps extends Omit<ComponentProps<"div">, "title"> {
  status?: ResultStatus;
  title?: ReactNode;
  subTitle?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
}
