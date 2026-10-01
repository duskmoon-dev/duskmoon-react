import React, { createContext, forwardRef, useContext, useId } from "react";
import {
  fabActionClass,
  fabActionsClass,
  fabLabelClass,
  fabTriggerClass,
  getFabClasses,
} from "../../classes/fab";
import { cn } from "../../utils";
import { Button } from "../button";
import type {
  FabComponent,
  FabLabelProps,
  FabProps,
  FabSectionProps,
  FabTriggerProps,
} from "./Fab.types";

const FabContext = createContext<{
  actionsId: string;
  speedDial: boolean;
} | null>(null);

function useFabContext() {
  const context = useContext(FabContext);
  if (!context) throw new Error("Fab subcomponents must be inside Fab");
  return context;
}

const Trigger = forwardRef<HTMLButtonElement, FabTriggerProps>(
  ({ extended, className, type = "button", ...props }, ref) => {
    const { actionsId, speedDial } = useFabContext();
    return (
      <Button
        {...props}
        ref={ref}
        type={type}
        popoverTarget={speedDial ? actionsId : undefined}
        className={cn(fabTriggerClass, extended && "fab-extended", className)}
      />
    );
  },
);
Trigger.displayName = "Fab.Trigger";

const Actions = forwardRef<HTMLDivElement, FabSectionProps>(
  ({ className, ...props }, ref) => {
    const { actionsId } = useFabContext();
    return (
      <div
        {...props}
        ref={ref}
        id={actionsId}
        popover="auto"
        className={cn(fabActionsClass, className)}
      />
    );
  },
);
Actions.displayName = "Fab.Actions";

const Action = forwardRef<HTMLDivElement, FabSectionProps>(
  ({ className, ...props }, ref) => (
    <div {...props} ref={ref} className={cn(fabActionClass, className)} />
  ),
);
Action.displayName = "Fab.Action";

const Label = forwardRef<HTMLSpanElement, FabLabelProps>(
  ({ className, ...props }, ref) => (
    <span {...props} ref={ref} className={cn(fabLabelClass, className)} />
  ),
);
Label.displayName = "Fab.Label";

const FabRoot = forwardRef<HTMLDivElement, FabProps>(
  (
    { contained, start, speedDial = false, className, children, ...props },
    ref,
  ) => {
    const actionsId = `fab-actions-${useId().replace(/:/g, "")}`;
    return (
      <FabContext.Provider value={{ actionsId, speedDial }}>
        <div
          {...props}
          ref={ref}
          className={getFabClasses({ contained, start, speedDial, className })}
        >
          {children}
        </div>
      </FabContext.Provider>
    );
  },
) as FabComponent;
FabRoot.displayName = "Fab";
FabRoot.Trigger = Trigger;
FabRoot.Actions = Actions;
FabRoot.Action = Action;
FabRoot.Label = Label;

export const Fab = FabRoot;
