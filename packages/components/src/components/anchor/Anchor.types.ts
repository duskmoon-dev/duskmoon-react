import type {
  ComponentProps,
  ForwardRefExoticComponent,
  MouseEvent,
  ReactNode,
  RefAttributes,
} from "react";

export interface AnchorItem {
  key?: string;
  href: string;
  title: ReactNode;
  target?: string;
  children?: AnchorItem[];
}

export interface AnchorLinkProps extends Omit<
  ComponentProps<"a">,
  "children" | "href" | "onClick" | "title"
> {
  href: string;
  title: ReactNode;
  target?: string;
  children?: ReactNode;
  onClick?: ComponentProps<"a">["onClick"];
}

export interface AnchorProps extends Omit<
  ComponentProps<"nav">,
  "onChange" | "onClick"
> {
  items?: AnchorItem[];
  targetOffset?: number;
  bounds?: number;
  offsetTop?: number;
  getContainer?: () => Window | HTMLElement;
  getCurrentAnchor?: (activeLink: string) => string;
  affix?: boolean;
  showInkInFixed?: boolean;
  onClick?: (
    event: MouseEvent<HTMLElement>,
    link: { title: ReactNode; href: string },
  ) => void;
  onChange?: (currentActiveLink: string) => void;
}

export type AnchorLinkComponent = ForwardRefExoticComponent<
  AnchorLinkProps & RefAttributes<HTMLAnchorElement>
>;

export type AnchorComponent = ForwardRefExoticComponent<
  AnchorProps & RefAttributes<HTMLElement>
> & {
  Link: AnchorLinkComponent;
};
