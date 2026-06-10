import React, { forwardRef, type CSSProperties } from "react";
import {
  drawerBodyClass,
  drawerCloseClass,
  drawerFooterClass,
  drawerHeaderClass,
  drawerTitleClass,
  getDrawerClasses,
} from "../../classes/drawer";
import type { DrawerProps } from "./Drawer.types";

const defaultCloseIcon = "x";

function getDrawerStyle({
  width,
  height,
  style,
}: {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  style?: CSSProperties;
}) {
  return {
    ...style,
    ...(width !== undefined ? { width } : undefined),
    ...(height !== undefined ? { height } : undefined),
  };
}

export const Drawer = forwardRef<HTMLElement, DrawerProps>(
  (
    {
      open = false,
      title,
      children,
      placement = "right",
      onClose,
      closeIcon = defaultCloseIcon,
      footer,
      extra,
      width,
      height,
      size = "md",
      className,
      style,
      role = "dialog",
      ...props
    },
    ref,
  ) => {
    const showClose = closeIcon !== null && closeIcon !== false;
    const showHeader = title !== undefined || extra !== undefined || showClose;

    return (
      <aside
        {...props}
        ref={ref}
        role={role}
        aria-hidden={open ? undefined : true}
        className={getDrawerClasses({ open, placement, size, className })}
        style={getDrawerStyle({ width, height, style })}
      >
        {showHeader ? (
          <div className={drawerHeaderClass}>
            {title !== undefined ? (
              <h2 className={drawerTitleClass}>{title}</h2>
            ) : null}
            {extra}
            {showClose ? (
              <button
                type="button"
                className={drawerCloseClass}
                aria-label="Close"
                onClick={onClose}
              >
                {closeIcon}
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={drawerBodyClass}>{children}</div>
        {footer !== undefined ? (
          <div className={drawerFooterClass}>{footer}</div>
        ) : null}
      </aside>
    );
  },
);

Drawer.displayName = "Drawer";
