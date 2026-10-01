import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type MegamenuProps = Omit<ComponentProps<"nav">, "ref">;
export type MegamenuBarProps = Omit<ComponentProps<"ul">, "ref">;
export type MegamenuItemProps = Omit<ComponentProps<"li">, "ref">;
export type MegamenuTriggerProps = Omit<ComponentProps<"button">, "ref">;
export interface MegamenuPanelProps extends Omit<ComponentProps<"div">, "ref"> {
  full?: boolean;
}
export type MegamenuGroupProps = Omit<ComponentProps<"section">, "ref">;
export type MegamenuHeadingProps = Omit<ComponentProps<"h2">, "ref">;
export type MegamenuSupportingProps = Omit<ComponentProps<"p">, "ref">;
export interface MegamenuMobileProps extends Omit<
  ComponentProps<"details">,
  "ref"
> {
  summary: ReactNode;
}

export interface MegamenuComponent extends ForwardRefExoticComponent<
  MegamenuProps & RefAttributes<HTMLElement>
> {
  Bar: ForwardRefExoticComponent<
    MegamenuBarProps & RefAttributes<HTMLUListElement>
  >;
  Item: ForwardRefExoticComponent<
    MegamenuItemProps & RefAttributes<HTMLLIElement>
  >;
  Trigger: ForwardRefExoticComponent<
    MegamenuTriggerProps & RefAttributes<HTMLButtonElement>
  >;
  Panel: ForwardRefExoticComponent<
    MegamenuPanelProps & RefAttributes<HTMLDivElement>
  >;
  Grid: ForwardRefExoticComponent<
    Omit<ComponentProps<"div">, "ref"> & RefAttributes<HTMLDivElement>
  >;
  Group: ForwardRefExoticComponent<
    MegamenuGroupProps & RefAttributes<HTMLElement>
  >;
  Heading: ForwardRefExoticComponent<
    MegamenuHeadingProps & RefAttributes<HTMLHeadingElement>
  >;
  Supporting: ForwardRefExoticComponent<
    MegamenuSupportingProps & RefAttributes<HTMLParagraphElement>
  >;
  Mobile: ForwardRefExoticComponent<
    MegamenuMobileProps & RefAttributes<HTMLDetailsElement>
  >;
}
