import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type {
  ConfigProviderContextValue,
  ConfigProviderProps,
} from "../config-provider";

export interface DmProviderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children" | "className"> {
  children?: ReactNode;
  className?: string;
  component?: ConfigProviderProps["component"];
  theme?: ConfigProviderContextValue["theme"];
  prefixCls?: string;
  locale?: Record<string, unknown>;
  direction?: ConfigProviderProps["direction"];
}
