import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
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

type TriggerElementProps = React.HTMLAttributes<HTMLElement>;

function callHandler<Event>(
  handler: ((event: Event) => void) | undefined,
  event: Event,
) {
  handler?.(event);
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
        className={cn(
          menuItemClass,
          item.danger && "menu-item-danger",
          item.className,
        )}
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
    const toggleVisible = () => setVisible(!visible);
    const menuNode =
      overlay ??
      (menu?.items ? (
        <ul className={dropdownMenuClass}>
          {menu.items.map((item) => renderMenuItem(item, menu.onClick, close))}
        </ul>
      ) : null);
    const popup = dropdownRender ? dropdownRender(menuNode) : menuNode;
    const shouldRenderPopup = !destroyPopupOnHide || visible;
    const triggerProps = {
      "aria-controls": visible ? overlayId : undefined,
      "aria-expanded": visible || undefined,
      onMouseEnter: hasTrigger(trigger, "hover")
        ? () => setVisible(true)
        : undefined,
      onMouseLeave: hasTrigger(trigger, "hover")
        ? () => setVisible(false)
        : undefined,
      onClick: hasTrigger(trigger, "click") ? toggleVisible : undefined,
      onContextMenu: hasTrigger(trigger, "contextMenu")
        ? (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            toggleVisible();
          }
        : undefined,
    };
    const triggerNode = isValidElement<TriggerElementProps>(children) ? (
      cloneElement(children as ReactElement<TriggerElementProps>, {
        "aria-controls":
          triggerProps["aria-controls"] ?? children.props["aria-controls"],
        "aria-expanded":
          triggerProps["aria-expanded"] ?? children.props["aria-expanded"],
        onMouseEnter: (event) => {
          callHandler(children.props.onMouseEnter, event);
          triggerProps.onMouseEnter?.();
          onMouseEnter?.(event);
        },
        onMouseLeave: (event) => {
          callHandler(children.props.onMouseLeave, event);
          triggerProps.onMouseLeave?.();
          onMouseLeave?.(event);
        },
        onClick: (event) => {
          callHandler(children.props.onClick, event);
          triggerProps.onClick?.();
          onClick?.(event);
        },
        onContextMenu: (event) => {
          callHandler(children.props.onContextMenu, event);
          triggerProps.onContextMenu?.(event);
          onContextMenu?.(event);
        },
      })
    ) : (
      <span
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-controls={triggerProps["aria-controls"]}
        aria-expanded={triggerProps["aria-expanded"]}
        onMouseEnter={(event) => {
          triggerProps.onMouseEnter?.();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          triggerProps.onMouseLeave?.();
          onMouseLeave?.(event);
        }}
        onClick={(event) => {
          triggerProps.onClick?.();
          onClick?.(event);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerProps.onClick?.();
          }
        }}
        onContextMenu={(event) => {
          triggerProps.onContextMenu?.(event);
          onContextMenu?.(event);
        }}
      >
        {children}
      </span>
    );

    return (
      <span {...props} ref={ref} className={dropdownWrapperClass}>
        {triggerNode}
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
