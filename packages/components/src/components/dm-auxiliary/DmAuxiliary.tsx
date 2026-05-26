import React, { forwardRef, useEffect, useState } from "react";
import {
  dmAuxiliaryActionClass,
  dmAuxiliaryActionsClass,
  dmAuxiliaryCloseClass,
  dmAuxiliaryContainerClass,
  dmAuxiliaryContentClass,
  dmAuxiliaryIconClass,
  getDmAuxiliaryClasses,
} from "../../classes/dm-auxiliary";
import type { DmAuxiliaryProps } from "./DmAuxiliary.types";

const defaultIcon = (
  <svg
    aria-hidden="true"
    focusable="false"
    width="21"
    height="21"
    viewBox="0 0 21 21"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5 2.167a8.333 8.333 0 1 1 0 16.666 8.333 8.333 0 0 1 0-16.666Zm0 1.666a6.667 6.667 0 1 0 0 13.334 6.667 6.667 0 0 0 0-13.334Zm0 5c.46 0 .833.374.833.834v4.166a.833.833 0 1 1-1.666 0V9.667c0-.46.373-.834.833-.834Zm0-2.5h.833V8H9.667V6.333h.833Z"
    />
  </svg>
);

function hasRenderableContent(content?: string, children?: React.ReactNode) {
  return Boolean(content || children);
}

export const DmAuxiliary = forwardRef<HTMLDivElement, DmAuxiliaryProps>(
  (
    {
      content = "",
      children,
      hideClose = false,
      icon = defaultIcon,
      actions,
      extra,
      onClose,
      className,
      ...props
    },
    ref,
  ) => {
    const [closed, setClosed] = useState(!hasRenderableContent(content, children));

    useEffect(() => {
      setClosed(!hasRenderableContent(content, children));
    }, [children, content]);

    if (closed) return null;

    function handleClose() {
      setClosed(true);
      onClose?.();
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getDmAuxiliaryClasses({ closed, className })}
      >
        <div className={dmAuxiliaryContainerClass}>
          {icon ? <span className={dmAuxiliaryIconClass}>{icon}</span> : null}
          <div className={dmAuxiliaryContentClass}>
            {children ?? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            )}
          </div>
          {actions?.length ? (
            <div className={dmAuxiliaryActionsClass}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className={dmAuxiliaryActionClass}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
          {extra}
          {!hideClose ? (
            <button
              type="button"
              className={dmAuxiliaryCloseClass}
              aria-label="Close auxiliary"
              onClick={handleClose}
            >
              x
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);

DmAuxiliary.displayName = "DmAuxiliary";

export default DmAuxiliary;

