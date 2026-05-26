import React, { forwardRef, useId, useState } from "react";
import {
  dropdownArrowClass,
  dropdownButtonClass,
  dropdownMenuClass,
  dropdownWrapperClass,
  getDropdownClasses,
} from "../../classes/dropdown";
import { menuDividerClass, menuItemClass } from "../../classes/menu";
import { cn } from "../../utils";
import { Button } from "../button";
import type {
  DropdownButtonProps,
  DropdownComponent,
  DropdownMenuItem,
  DropdownProps,
} from "./Dropdown.types";

function hasTrigger(triggers: DropdownProps["trigger"], trigger: string) {
  return (triggers ?? ["hover"]).includes(trigger as never);
}

function renderMenuItem(
  item: DropdownMenuItem,
  onClick: NonNullable<DropdownProps["menu"]>["onClick"] | undefined,
  close: () => void,
) {
  if (item.type === "divider") {
    return <li key={String(item.key)} className={menuDividerClass} />;
  }

  return (
    <li key={String(item.key)}>
      <button
        type="button"
        className={cn(menuItemClass, item.danger && "menu-item-danger", item.className)}
        disabled={item.disabled}
        onClick={(event) => {
          onClick?.({ key: String(item.key), item, domEvent: event });
          close();
        }}
      >
        {item.icon ? <span className="menu-item-icon">{item.icon}</span> : null}
        <span>{item.label}</span>
      </button>
    </li>
  );
}

const DropdownRoot = forwardRef<HTMLSpanElement, DropdownProps>(
  (
    {
      arrow,
      children,
      className,
      defaultOpen,
      destroyPopupOnHide,
      disabled,
      dropdownRender,
      menu,
      onContextMenu,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onOpenChange,
      open,
      overlay,
      placement = "bottomLeft",
      trigger = ["hover"],
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(Boolean(defaultOpen));
    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;
    const overlayId = useId();

    function setVisible(nextOpen: boolean) {
      if (disabled) return;

      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    }

    const close = () => setVisible(false);
    const menuNode =
      overlay ??
      (menu?.items ? (
        <ul className={dropdownMenuClass}>
          {menu.items.map((item) => renderMenuItem(item, menu.onClick, close))}
        </ul>
      ) : null);
    const popup = dropdownRender ? dropdownRender(menuNode) : menuNode;
    const shouldRenderPopup = !destroyPopupOnHide || visible;

    return (
      <span
        {...props}
        ref={ref}
        className={dropdownWrapperClass}
        aria-controls={visible ? overlayId : undefined}
        aria-expanded={visible || undefined}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          if (hasTrigger(trigger, "hover")) setVisible(true);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          if (hasTrigger(trigger, "hover")) setVisible(false);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (hasTrigger(trigger, "click")) setVisible(!visible);
        }}
        onContextMenu={(event) => {
          onContextMenu?.(event);
          if (hasTrigger(trigger, "contextMenu")) {
            event.preventDefault();
            setVisible(!visible);
          }
        }}
      >
        {children}
        {shouldRenderPopup ? (
          <span
            id={overlayId}
            role="menu"
            className={getDropdownClasses({
              placement,
              open: visible,
              arrow,
              className,
            })}
          >
            {popup}
            {arrow ? <span className={dropdownArrowClass} /> : null}
          </span>
        ) : null}
      </span>
    );
  },
);

DropdownRoot.displayName = "Dropdown";

const DropdownButton = forwardRef<HTMLSpanElement, DropdownButtonProps>(
  (
    {
      buttonsRender,
      children,
      disabled,
      menu,
      onClick,
      trigger = ["click"],
      ...props
    },
    ref,
  ) => {
    const buttons = [
      <Button key="primary" disabled={disabled} onClick={onClick}>
        {children}
      </Button>,
      <Button key="trigger" aria-label="Open dropdown" disabled={disabled}>
        v
      </Button>,
    ];
    const renderedButtons = buttonsRender ? buttonsRender(buttons) : buttons;

    return (
      <DropdownRoot
        {...props}
        ref={ref}
        menu={menu}
        trigger={trigger}
        disabled={disabled}
      >
        <span className={dropdownButtonClass}>{renderedButtons}</span>
      </DropdownRoot>
    );
  },
);

DropdownButton.displayName = "Dropdown.Button";

export const Dropdown = Object.assign(DropdownRoot, {
  Button: DropdownButton,
}) as DropdownComponent;
