import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  dropdownArrowClass,
  dropdownButtonClass,
  dropdownMenuClass,
  dropdownPlacementClasses,
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

type TriggerProps = React.ComponentProps<"button">;

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
    const [nativeOpen, setNativeOpen] = useState(Boolean(open ?? defaultOpen));
    const visible = open ?? internalOpen;
    const popupRef = useRef<HTMLSpanElement>(null);
    const popupId = useId();
    // TODO(upstream): duskmoon-dev/duskmoonui#66
    // WORKAROUND(upstream): duskmoon-dev/duskmoonui#66 needs explicit anchors for documented placement.
    const anchorName = `--dm-dropdown-${popupId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const clickTrigger = trigger.includes("click") || trigger.includes("hover");

    useEffect(() => {
      const popup = popupRef.current;
      if (!popup?.showPopover || !popup?.hidePopover) return;
      if (visible && !popup.matches(":popover-open")) popup.showPopover();
      if (!visible && popup.matches(":popover-open")) popup.hidePopover();
    }, [visible]);

    function setVisible(nextOpen: boolean) {
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    }

    function close() {
      const popup = popupRef.current;
      if (popup?.matches(":popover-open")) popup.hidePopover();
      else setVisible(false);
    }

    const menuNode =
      overlay ??
      (menu?.items ? (
        <ul className={dropdownMenuClass}>
          {menu.items.map((item) => renderMenuItem(item, menu.onClick, close))}
        </ul>
      ) : null);
    const popup = dropdownRender ? dropdownRender(menuNode) : menuNode;
    const show = () => !disabled && popupRef.current?.showPopover?.();
    const hide = () => !disabled && popupRef.current?.hidePopover?.();
    const toggle = () => {
      if (disabled) return;
      if (popupRef.current?.matches(":popover-open")) hide();
      else show();
    };

    const childIsButton =
      isValidElement(children) &&
      (children.type === "button" || children.type === Button);
    const triggerNode = isValidElement(children) ? (
      cloneElement(children as ReactElement<TriggerProps>, {
        popoverTarget:
          childIsButton && clickTrigger && !disabled ? popupId : undefined,
        style: {
          ...(children as ReactElement<TriggerProps>).props.style,
          anchorName,
        } as React.CSSProperties,
        "aria-controls": popupId,
        "aria-expanded": nativeOpen,
        disabled:
          disabled || (children as ReactElement<TriggerProps>).props.disabled,
        onMouseEnter: (event) => {
          callHandler(
            (children as ReactElement<TriggerProps>).props.onMouseEnter,
            event,
          );
          if (trigger.includes("hover")) show();
          onMouseEnter?.(event);
        },
        onMouseLeave: (event) => {
          callHandler(
            (children as ReactElement<TriggerProps>).props.onMouseLeave,
            event,
          );
          onMouseLeave?.(event);
        },
        onClick: (event) => {
          callHandler(
            (children as ReactElement<TriggerProps>).props.onClick,
            event,
          );
          onClick?.(event);
          if (!childIsButton && clickTrigger && !event.defaultPrevented)
            toggle();
        },
        onContextMenu: (event) => {
          callHandler(
            (children as ReactElement<TriggerProps>).props.onContextMenu,
            event,
          );
          if (trigger.includes("contextMenu")) {
            event.preventDefault();
            toggle();
          }
          onContextMenu?.(event);
        },
      })
    ) : (
      <button
        type="button"
        disabled={disabled}
        popoverTarget={clickTrigger && !disabled ? popupId : undefined}
        style={{ anchorName } as React.CSSProperties}
        aria-controls={popupId}
        aria-expanded={nativeOpen}
        onMouseEnter={(event) => {
          if (trigger.includes("hover")) show();
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
        }}
        onClick={onClick}
        onContextMenu={(event) => {
          if (trigger.includes("contextMenu")) {
            event.preventDefault();
            toggle();
          }
          onContextMenu?.(event);
        }}
      >
        {children}
      </button>
    );

    return (
      <span
        {...props}
        ref={ref}
        className={cn(
          dropdownWrapperClass,
          dropdownPlacementClasses[placement],
        )}
        onMouseLeave={trigger.includes("hover") ? hide : undefined}
      >
        {triggerNode}
        <span
          id={popupId}
          ref={popupRef}
          popover="auto"
          style={{ positionAnchor: anchorName } as React.CSSProperties}
          className={getDropdownClasses({ className, arrow })}
          onToggle={(event) => {
            if (event.target !== event.currentTarget) return;
            const nextOpen = event.nativeEvent.newState === "open";
            setNativeOpen(nextOpen);
            setVisible(nextOpen);
          }}
        >
          {!destroyPopupOnHide || visible ? popup : null}
          {arrow ? <span className={dropdownArrowClass} /> : null}
        </span>
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
      color = "base",
      appearance = "outline",
      size,
      shape,
      block,
      isLoading,
      leftIcon,
      rightIcon,
      confirm,
      ...props
    },
    ref,
  ) => {
    const buttonStyle = { color, appearance, size, shape };
    const buttons = [
      <Button
        key="primary"
        {...buttonStyle}
        disabled={disabled}
        isLoading={isLoading}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        confirm={confirm}
        onClick={onClick}
      >
        {children}
      </Button>,
      <Button
        key="trigger"
        {...buttonStyle}
        type="button"
        aria-label="Open dropdown"
        disabled={disabled || isLoading}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
        </svg>
      </Button>,
    ];
    const renderedButtons = buttonsRender ? buttonsRender(buttons) : buttons;

    return (
      <span
        ref={ref}
        className={cn(dropdownButtonClass, block && "dropdown-button-block")}
      >
        {renderedButtons[0]}
        <DropdownRoot
          {...props}
          menu={menu}
          trigger={trigger}
          disabled={disabled || isLoading}
        >
          {renderedButtons[1]}
        </DropdownRoot>
      </span>
    );
  },
);

DropdownButton.displayName = "Dropdown.Button";

export const Dropdown = Object.assign(DropdownRoot, {
  Button: DropdownButton,
}) as DropdownComponent;
