import React, { forwardRef, useState } from "react";
import {
  getLayoutClasses,
  getLayoutSiderClasses,
  layoutContentClass,
  layoutFooterClass,
  layoutHeaderClass,
  layoutTriggerClass,
} from "../../classes/layout";
import { cn } from "../../utils";
import type {
  LayoutComponent,
  LayoutProps,
  LayoutSectionProps,
  LayoutSiderProps,
} from "./Layout.types";

function toSize(value: LayoutSiderProps["width"]) {
  return typeof value === "number" ? `${value}px` : value;
}

const Header = forwardRef<HTMLDivElement, LayoutSectionProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(layoutHeaderClass, className)} />
  ),
);

Header.displayName = "Layout.Header";

const Content = forwardRef<HTMLDivElement, LayoutSectionProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(layoutContentClass, className)} />
  ),
);

Content.displayName = "Layout.Content";

const Footer = forwardRef<HTMLDivElement, LayoutSectionProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(layoutFooterClass, className)} />
  ),
);

Footer.displayName = "Layout.Footer";

const Sider = forwardRef<HTMLDivElement, LayoutSiderProps>(
  (
    {
      children,
      collapsible,
      collapsed,
      defaultCollapsed,
      onCollapse,
      width = 200,
      collapsedWidth = 80,
      trigger,
      breakpoint,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const controlled = collapsed !== undefined;
    const [internalCollapsed, setInternalCollapsed] = useState(
      () => defaultCollapsed ?? false,
    );
    const mergedCollapsed = controlled ? collapsed : internalCollapsed;
    const siderWidth = toSize(mergedCollapsed ? collapsedWidth : width);

    function toggleCollapsed() {
      const nextCollapsed = !mergedCollapsed;

      if (!controlled) {
        setInternalCollapsed(nextCollapsed);
      }

      onCollapse?.(nextCollapsed, "clickTrigger");
    }

    return (
      <div
        {...props}
        ref={ref}
        data-breakpoint={breakpoint}
        className={getLayoutSiderClasses({
          collapsed: mergedCollapsed,
          className,
        })}
        style={{
          flex: `0 0 ${siderWidth}`,
          maxWidth: siderWidth,
          minWidth: siderWidth,
          width: siderWidth,
          ...style,
        }}
      >
        {children}
        {collapsible && trigger !== null ? (
          <button
            type="button"
            className={layoutTriggerClass}
            aria-label={mergedCollapsed ? "Expand sider" : "Collapse sider"}
            onClick={toggleCollapsed}
          >
            {trigger ?? (mergedCollapsed ? ">" : "<")}
          </button>
        ) : null}
      </div>
    );
  },
);

Sider.displayName = "Layout.Sider";

const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(
  ({ hasSider, className, ...props }, ref) => (
    <div
      {...props}
      ref={ref}
      className={getLayoutClasses({ hasSider, className })}
    />
  ),
) as LayoutComponent;

LayoutRoot.displayName = "Layout";
LayoutRoot.Header = Header;
LayoutRoot.Sider = Sider;
LayoutRoot.Content = Content;
LayoutRoot.Footer = Footer;

export const Layout = LayoutRoot;
