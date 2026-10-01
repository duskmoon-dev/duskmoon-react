import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import type { ConsolePageSidebarState } from "../../classes/console-page";

export interface ConsolePageProps extends Omit<ComponentProps<"div">, "ref"> {
  sidebarState?: ConsolePageSidebarState;
}

export type ConsolePageFrameProps = Omit<ComponentProps<"div">, "ref">;
export type ConsolePageAppbarProps = Omit<ComponentProps<"header">, "ref">;
export type ConsolePageSidebarProps = Omit<ComponentProps<"aside">, "ref">;
export type ConsolePageSidebarBodyProps = Omit<ComponentProps<"nav">, "ref">;
export type ConsolePageMainProps = Omit<ComponentProps<"main">, "ref">;
export type ConsolePageButtonProps = Omit<ComponentProps<"button">, "ref">;

export interface ConsolePageComponent extends ForwardRefExoticComponent<
  ConsolePageProps & RefAttributes<HTMLDivElement>
> {
  Frame: ForwardRefExoticComponent<
    ConsolePageFrameProps & RefAttributes<HTMLDivElement>
  >;
  Appbar: ForwardRefExoticComponent<
    ConsolePageAppbarProps & RefAttributes<HTMLElement>
  >;
  Sidebar: ForwardRefExoticComponent<
    ConsolePageSidebarProps & RefAttributes<HTMLElement>
  >;
  SidebarHeader: ForwardRefExoticComponent<
    ConsolePageFrameProps & RefAttributes<HTMLDivElement>
  >;
  SidebarBody: ForwardRefExoticComponent<
    ConsolePageSidebarBodyProps & RefAttributes<HTMLElement>
  >;
  SidebarFooter: ForwardRefExoticComponent<
    ConsolePageFrameProps & RefAttributes<HTMLDivElement>
  >;
  Main: ForwardRefExoticComponent<
    ConsolePageMainProps & RefAttributes<HTMLElement>
  >;
  SidebarToggle: ForwardRefExoticComponent<
    ConsolePageButtonProps & RefAttributes<HTMLButtonElement>
  >;
  MobileTrigger: ForwardRefExoticComponent<
    ConsolePageButtonProps & RefAttributes<HTMLButtonElement>
  >;
  MobileMenu: ForwardRefExoticComponent<
    ConsolePageSidebarBodyProps & RefAttributes<HTMLElement>
  >;
}
