import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type ListSize = "sm" | "md" | "lg";

export interface ListProps<T = unknown> extends Omit<
  ComponentProps<"div">,
  "children"
> {
  dataSource?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  children?: ReactNode;
  bordered?: boolean;
  size?: ListSize;
}

export interface ListItemProps extends ComponentProps<"div"> {
  actions?: ReactNode[] | ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
}

export interface ListItemMetaProps extends Omit<
  ComponentProps<"div">,
  "title"
> {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
}

export type ListItemMetaComponent = ForwardRefExoticComponent<
  ListItemMetaProps & RefAttributes<HTMLDivElement>
>;

export type ListItemComponent = ForwardRefExoticComponent<
  ListItemProps & RefAttributes<HTMLDivElement>
> & {
  Meta: ListItemMetaComponent;
};

export type ListComponent = (<T = unknown>(
  props: ListProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & {
  Item: ListItemComponent;
  displayName?: string;
};
