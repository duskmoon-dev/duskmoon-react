import React, {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ComponentProps,
  type CSSProperties,
} from "react";
import {
  megamenuBarClass,
  megamenuClass,
  megamenuGridClass,
  megamenuGroupClass,
  megamenuHeadingClass,
  megamenuMobileClass,
  megamenuPanelClass,
  megamenuSupportingClass,
  megamenuTriggerClass,
} from "../../classes/megamenu";
import { cn } from "../../utils";
import type {
  MegamenuBarProps,
  MegamenuComponent,
  MegamenuGroupProps,
  MegamenuHeadingProps,
  MegamenuItemProps,
  MegamenuMobileProps,
  MegamenuPanelProps,
  MegamenuProps,
  MegamenuSupportingProps,
  MegamenuTriggerProps,
} from "./Megamenu.types";

const ItemContext = createContext<{ panelId: string } | null>(null);

function useItem() {
  const context = useContext(ItemContext);
  if (!context)
    throw new Error("Megamenu.Trigger and Panel require Megamenu.Item");
  return context;
}

const Bar = forwardRef<HTMLUListElement, MegamenuBarProps>(
  ({ className, ...props }, ref) => (
    <ul
      {...props}
      ref={ref}
      className={cn(megamenuBarClass, "megamenu-desktop", className)}
    />
  ),
);
Bar.displayName = "Megamenu.Bar";

const Item = forwardRef<HTMLLIElement, MegamenuItemProps>(
  ({ style, children, ...props }, ref) => {
    const key = useId().replace(/:/g, "");
    const panelId = `megamenu-panel-${key}`;
    const anchorStyle = {
      ...style,
      "--megamenu-anchor": `--megamenu-${key}`,
    } as CSSProperties;
    return (
      <ItemContext.Provider value={{ panelId }}>
        <li {...props} ref={ref} style={anchorStyle}>
          {children}
        </li>
      </ItemContext.Provider>
    );
  },
);
Item.displayName = "Megamenu.Item";

const Trigger = forwardRef<HTMLButtonElement, MegamenuTriggerProps>(
  ({ className, type = "button", ...props }, ref) => {
    const { panelId } = useItem();
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        popoverTarget={panelId}
        className={cn(megamenuTriggerClass, className)}
      />
    );
  },
);
Trigger.displayName = "Megamenu.Trigger";

const Panel = forwardRef<HTMLDivElement, MegamenuPanelProps>(
  ({ full, className, ...props }, ref) => {
    const { panelId } = useItem();
    return (
      <div
        {...props}
        ref={ref}
        id={panelId}
        popover="auto"
        className={cn(
          megamenuPanelClass,
          full && "megamenu-panel-full",
          className,
        )}
      />
    );
  },
);
Panel.displayName = "Megamenu.Panel";

const Grid = forwardRef<HTMLDivElement, Omit<ComponentProps<"div">, "ref">>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(megamenuGridClass, className)} />
  ),
);
Grid.displayName = "Megamenu.Grid";

const Group = forwardRef<HTMLElement, MegamenuGroupProps>(
  ({ className, ...props }, ref) => (
    <section
      {...props}
      ref={ref}
      className={cn(megamenuGroupClass, className)}
    />
  ),
);
Group.displayName = "Megamenu.Group";

const Heading = forwardRef<HTMLHeadingElement, MegamenuHeadingProps>(
  ({ className, ...props }, ref) => (
    <h2 {...props} ref={ref} className={cn(megamenuHeadingClass, className)} />
  ),
);
Heading.displayName = "Megamenu.Heading";

const Supporting = forwardRef<HTMLParagraphElement, MegamenuSupportingProps>(
  ({ className, ...props }, ref) => (
    <p
      {...props}
      ref={ref}
      className={cn(megamenuSupportingClass, className)}
    />
  ),
);
Supporting.displayName = "Megamenu.Supporting";

const Mobile = forwardRef<HTMLDetailsElement, MegamenuMobileProps>(
  ({ summary, className, children, ...props }, ref) => (
    <details
      {...props}
      ref={ref}
      className={cn(megamenuMobileClass, className)}
    >
      <summary>{summary}</summary>
      {children}
    </details>
  ),
);
Mobile.displayName = "Megamenu.Mobile";

const MegamenuRoot = forwardRef<HTMLElement, MegamenuProps>(
  (
    {
      trigger,
      panelHeading,
      panel,
      mobile,
      leading,
      fullWidth,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const key = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const panelId = `dm-megamenu-${key}`;
    const headingId = `${panelId}-heading`;
    const anchorStyle = {
      "--megamenu-anchor": `--dm-megamenu-${key}`,
    } as CSSProperties;
    return (
      <nav {...props} ref={ref} className={cn(megamenuClass, className)}>
        {trigger != null ? (
          <>
            <Bar>
              {leading != null && <li>{leading}</li>}
              <li>
                <button
                  type="button"
                  className={megamenuTriggerClass}
                  popoverTarget={panelId}
                  style={anchorStyle}
                >
                  {trigger}
                </button>
                <div
                  id={panelId}
                  className={cn(
                    megamenuPanelClass,
                    fullWidth && "megamenu-panel-full",
                  )}
                  popover="auto"
                  aria-labelledby={headingId}
                  style={anchorStyle}
                >
                  <Heading id={headingId}>{panelHeading}</Heading>
                  {panel}
                </div>
              </li>
            </Bar>
            <div className={megamenuMobileClass}>{mobile}</div>
          </>
        ) : (
          children
        )}
      </nav>
    );
  },
) as MegamenuComponent;
MegamenuRoot.displayName = "Megamenu";
MegamenuRoot.Bar = Bar;
MegamenuRoot.Item = Item;
MegamenuRoot.Trigger = Trigger;
MegamenuRoot.Panel = Panel;
MegamenuRoot.Grid = Grid;
MegamenuRoot.Group = Group;
MegamenuRoot.Heading = Heading;
MegamenuRoot.Supporting = Supporting;
MegamenuRoot.Mobile = Mobile;

export const Megamenu = MegamenuRoot;
