import { forwardRef, useId, type CSSProperties } from "react";
import { cn } from "../../utils";
import type { MegamenuProps } from "./Megamenu.types";

export const Megamenu = forwardRef<HTMLElement, MegamenuProps>(
  (
    {
      trigger,
      panelHeading,
      panel,
      mobile,
      leading,
      fullWidth,
      className,
      ...props
    },
    ref,
  ) => {
    const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const panelId = `dm-megamenu-${instanceId}`;
    const headingId = `${panelId}-heading`;
    const anchorStyle = {
      "--megamenu-anchor": `--dm-megamenu-${instanceId}`,
    } as CSSProperties;

    return (
      <nav {...props} ref={ref} className={cn("megamenu", className)}>
        <ul className="megamenu-bar megamenu-desktop">
          {leading != null && <li>{leading}</li>}
          <li>
            <button
              type="button"
              className="megamenu-trigger"
              popoverTarget={panelId}
              style={anchorStyle}
            >
              {trigger}
            </button>
            <div
              id={panelId}
              className={cn(
                "megamenu-panel",
                fullWidth && "megamenu-panel-full",
              )}
              popover="auto"
              aria-labelledby={headingId}
              style={anchorStyle}
            >
              <h2 id={headingId} className="megamenu-heading">
                {panelHeading}
              </h2>
              {panel}
            </div>
          </li>
        </ul>
        <div className="megamenu-mobile">{mobile}</div>
      </nav>
    );
  },
);

Megamenu.displayName = "Megamenu";
