import type {
  ComponentPropsWithoutRef,
  Context,
  ElementType,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type ConfigDirection = "ltr" | "rtl";

export interface ConfigProviderTheme {
  token?: Record<string, unknown>;
  components?: Record<string, unknown>;
  algorithm?: unknown;
  hashed?: boolean;
  cssVar?: boolean | Record<string, unknown>;
}

export interface ConfigProviderContextValue {
  prefixCls: string;
  iconPrefixCls: string;
  direction?: ConfigDirection;
  locale?: Record<string, unknown>;
  theme?: ConfigProviderTheme;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  renderEmpty?: (componentName?: string) => ReactNode;
  virtual?: boolean;
  wave?: Record<string, unknown> | false;
}

export interface ConfigProviderProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children" | "className" | "prefix"
> {
  children?: ReactNode;
  className?: string;
  component?: false | ElementType;
  prefixCls?: string;
  iconPrefixCls?: string;
  direction?: ConfigDirection;
  locale?: Record<string, unknown>;
  theme?: ConfigProviderTheme;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  renderEmpty?: (componentName?: string) => ReactNode;
  virtual?: boolean;
  wave?: Record<string, unknown> | false;
}

export interface ConfigProviderComponent extends ForwardRefExoticComponent<
  ConfigProviderProps & RefAttributes<HTMLElement>
> {
  ConfigContext: Context<ConfigProviderContextValue>;
  useConfig: () => ConfigProviderContextValue;
  config: (config: Partial<ConfigProviderContextValue>) => void;
}
