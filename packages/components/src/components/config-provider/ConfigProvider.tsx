import React, { createContext, forwardRef, useContext, useMemo } from "react";
import { getConfigProviderClasses } from "../../classes/config-provider";
import type {
  ConfigProviderComponent,
  ConfigProviderContextValue,
  ConfigProviderProps,
} from "./ConfigProvider.types";

const defaultConfig: ConfigProviderContextValue = {
  prefixCls: "dm",
  iconPrefixCls: "dmicon",
  direction: "ltr",
  virtual: true,
};

let globalConfig: Partial<ConfigProviderContextValue> = {};

export const ConfigContext = createContext<
  ConfigProviderContextValue | undefined
>(undefined);

const ConfigProviderBase = forwardRef<HTMLElement, ConfigProviderProps>(
  (
    {
      children,
      className,
      component: Component = "div",
      prefixCls,
      iconPrefixCls,
      direction,
      locale,
      theme,
      getPopupContainer,
      renderEmpty,
      virtual,
      wave,
      ...props
    },
    ref,
  ) => {
    const context = useContext(ConfigContext);
    const parent = useMemo(
      () =>
        context ?? {
          ...defaultConfig,
          ...globalConfig,
        },
      [context],
    );
    const value = useMemo<ConfigProviderContextValue>(
      () => ({
        ...defaultConfig,
        ...globalConfig,
        ...parent,
        prefixCls:
          prefixCls ?? parent.prefixCls ?? globalConfig.prefixCls ?? "dm",
        iconPrefixCls:
          iconPrefixCls ??
          parent.iconPrefixCls ??
          globalConfig.iconPrefixCls ??
          "dmicon",
        direction:
          direction ?? parent.direction ?? globalConfig.direction ?? "ltr",
        locale: locale ?? parent.locale ?? globalConfig.locale,
        theme: theme ?? parent.theme ?? globalConfig.theme,
        getPopupContainer:
          getPopupContainer ??
          parent.getPopupContainer ??
          globalConfig.getPopupContainer,
        renderEmpty:
          renderEmpty ?? parent.renderEmpty ?? globalConfig.renderEmpty,
        virtual: virtual ?? parent.virtual ?? globalConfig.virtual ?? true,
        wave: wave ?? parent.wave ?? globalConfig.wave,
      }),
      [
        direction,
        getPopupContainer,
        iconPrefixCls,
        locale,
        parent,
        prefixCls,
        renderEmpty,
        theme,
        virtual,
        wave,
      ],
    );

    const content = (
      <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
    );

    if (Component === false) {
      return content;
    }

    return React.createElement(
      Component,
      {
        ...props,
        ref,
        dir: value.direction,
        className: getConfigProviderClasses({
          direction: value.direction,
          className,
        }),
      },
      content,
    );
  },
);

ConfigProviderBase.displayName = "ConfigProvider";

export const ConfigProvider = ConfigProviderBase as ConfigProviderComponent;

ConfigProvider.ConfigContext =
  ConfigContext as React.Context<ConfigProviderContextValue>;
ConfigProvider.useConfig = () => {
  const context = useContext(ConfigContext);

  return context ?? { ...defaultConfig, ...globalConfig };
};
ConfigProvider.config = (config) => {
  globalConfig = { ...globalConfig, ...config };
};
