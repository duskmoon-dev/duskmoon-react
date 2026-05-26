import React, { forwardRef } from "react";
import {
  getCheckableTagClasses,
  getTagClasses,
  tagCloseClass,
  tagIconClass,
} from "../../classes/tag";
import { cn } from "../../utils";
import type { CheckableTagProps, TagComponent, TagProps } from "./Tag.types";

const defaultCloseIcon = "x";

const TagRoot = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      color,
      icon,
      closable,
      onClose,
      closeIcon = defaultCloseIcon,
      bordered = true,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={getTagClasses({ color, bordered, className })}
      {...props}
    >
      {icon ? (
        <span className={tagIconClass} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
      {closable ? (
        <button
          type="button"
          className={tagCloseClass}
          aria-label="Close"
          onClick={onClose}
        >
          {closeIcon}
        </button>
      ) : null}
    </span>
  ),
);

TagRoot.displayName = "Tag";

const CheckableTag = forwardRef<HTMLSpanElement, CheckableTagProps>(
  (
    {
      checked = false,
      onChange,
      disabled,
      className,
      children,
      onClick,
      onKeyDown,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    function emitChange() {
      if (disabled) {
        return;
      }

      onChange?.(!checked);
    }

    function handleClick(event: React.MouseEvent<HTMLSpanElement>) {
      onClick?.(event);

      if (event.defaultPrevented) {
        return;
      }

      emitChange();
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
      onKeyDown?.(event);

      if (
        event.defaultPrevented ||
        (event.key !== "Enter" && event.key !== " ")
      ) {
        return;
      }

      event.preventDefault();
      emitChange();
    }

    return (
      <span
        {...props}
        ref={ref}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        className={cn(getCheckableTagClasses({ checked, disabled }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </span>
    );
  },
);

CheckableTag.displayName = "Tag.CheckableTag";

export const Tag = Object.assign(TagRoot, {
  CheckableTag,
}) as TagComponent;

export { CheckableTag };
