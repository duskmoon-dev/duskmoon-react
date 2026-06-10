import type { ComponentProps, CSSProperties, ReactNode } from "react";
import type { SpinProps } from "../spin";

export type DmStatusType = "empty" | "loading" | "error" | "success";

export interface DmStatusProps extends Omit<ComponentProps<"div">, "children"> {
  status?: DmStatusType;
  height?: string | number;
  loadingProps?: SpinProps;
  description?: ReactNode;
  image?: string | ReactNode;
  children?: ReactNode;
  imageStyle?: CSSProperties;
}
