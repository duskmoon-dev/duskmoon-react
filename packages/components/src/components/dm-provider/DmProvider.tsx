import React, { forwardRef, useEffect, useState } from "react";
import { getDmProviderClasses } from "../../classes/dm-provider";
import {
  getDmTheme,
  onDmThemeUpdate,
  setDmPrefixCls,
  setDmPrimaryColor,
} from "../../infrastructure";
import { ConfigProvider } from "../config-provider";
import type { DmProviderProps } from "./DmProvider.types";

export const DmProvider = forwardRef<HTMLElement, DmProviderProps>(
  (
    {
      children,
      className,
      component = "div",
      direction,
      locale,
      prefixCls,
      theme,
      ...props
    },
    ref,
  ) => {
    const [currentTheme, setCurrentTheme] = useState(() => getDmTheme());

    useEffect(() => {
      return onDmThemeUpdate(() => {
        setCurrentTheme(getDmTheme());
      });
    }, []);

    useEffect(() => {
      if (prefixCls) {
        setDmPrefixCls(prefixCls);
      }
    }, [prefixCls]);

    useEffect(() => {
      const colorPrimary = theme?.token?.colorPrimary;

      if (typeof colorPrimary === "string") {
        setDmPrimaryColor(colorPrimary);
      }
    }, [theme]);

    return (
      <ConfigProvider
        {...props}
        ref={ref}
        component={component}
        className={getDmProviderClasses({ className })}
        direction={direction}
        locale={locale}
        prefixCls={prefixCls ?? currentTheme.prefixCls}
        theme={theme ?? currentTheme}
      >
        {children}
      </ConfigProvider>
    );
  },
);

DmProvider.displayName = "DmProvider";
