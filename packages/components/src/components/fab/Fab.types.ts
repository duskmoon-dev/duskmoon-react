import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import type { ButtonProps } from "../button";

export interface FabProps extends Omit<ComponentProps<"div">, "ref"> {
  contained?: boolean;
  start?: boolean;
  speedDial?: boolean;
}

export interface FabTriggerProps extends ButtonProps {
  extended?: boolean;
}

export type FabSectionProps = Omit<ComponentProps<"div">, "ref">;
export type FabLabelProps = Omit<ComponentProps<"span">, "ref">;

export interface FabComponent extends ForwardRefExoticComponent<
  FabProps & RefAttributes<HTMLDivElement>
> {
  Trigger: ForwardRefExoticComponent<
    FabTriggerProps & RefAttributes<HTMLButtonElement>
  >;
  Actions: ForwardRefExoticComponent<
    FabSectionProps & RefAttributes<HTMLDivElement>
  >;
  Action: ForwardRefExoticComponent<
    FabSectionProps & RefAttributes<HTMLDivElement>
  >;
  Label: ForwardRefExoticComponent<
    FabLabelProps & RefAttributes<HTMLSpanElement>
  >;
}
