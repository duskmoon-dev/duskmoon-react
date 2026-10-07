import type { ComponentProps, ReactNode } from "react";

export interface MegamenuProps extends Omit<ComponentProps<"nav">, "children"> {
  "aria-label": string;
  trigger: ReactNode;
  panelHeading: ReactNode;
  panel: ReactNode;
  mobile: ReactNode;
  leading?: ReactNode;
  fullWidth?: boolean;
}
