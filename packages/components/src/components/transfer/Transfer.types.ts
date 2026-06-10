import type {
  ComponentProps,
  CSSProperties,
  ForwardRefExoticComponent,
  ReactElement,
  ReactNode,
  RefAttributes,
} from "react";

export type TransferDirection = "left" | "right";
export type TransferKey = string;

export interface TransferItem {
  key: TransferKey;
  title?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  [name: string]: unknown;
}

export type TransferRenderResult =
  | ReactNode
  | {
      label: ReactNode;
      value: string;
    };

export type TransferRender<T extends TransferItem = TransferItem> = (
  item: T,
) => TransferRenderResult;

export type TransferFilterOption<T extends TransferItem = TransferItem> = (
  inputValue: string,
  item: T,
  direction: TransferDirection,
) => boolean;

export interface TransferPaginationConfig {
  pageSize?: number;
}

export interface TransferLocale {
  itemUnit?: string;
  itemsUnit?: string;
  notFoundContent?: ReactNode;
  searchPlaceholder?: string;
}

export interface TransferListProps<T extends TransferItem = TransferItem>
  extends Omit<ComponentProps<"div">, "children" | "title"> {
  direction: TransferDirection;
  title?: ReactNode;
  items: T[];
  selectedKeys?: TransferKey[];
  disabled?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  notFoundContent?: ReactNode;
  render?: TransferRender<T>;
  filterOption?: TransferFilterOption<T>;
  pagination?: boolean | TransferPaginationConfig;
  listStyle?: CSSProperties | ((style: { direction: TransferDirection }) => CSSProperties);
  onSearch?: (direction: TransferDirection, value: string) => void;
  onItemSelect?: (key: TransferKey, selected: boolean) => void;
}

export interface TransferSearchProps
  extends Omit<ComponentProps<"input">, "onChange" | "size"> {
  onChange?: (value: string) => void;
}

export interface TransferOperationProps
  extends Omit<ComponentProps<"div">, "children"> {
  disabled?: boolean;
  oneWay?: boolean;
  operations?: ReactNode[];
  moveToRightDisabled?: boolean;
  moveToLeftDisabled?: boolean;
  onMoveToRight?: () => void;
  onMoveToLeft?: () => void;
}

export interface TransferProps<T extends TransferItem = TransferItem>
  extends Omit<ComponentProps<"div">, "children" | "onChange" | "title"> {
  dataSource?: T[];
  targetKeys?: TransferKey[];
  defaultTargetKeys?: TransferKey[];
  selectedKeys?: TransferKey[];
  defaultSelectedKeys?: TransferKey[];
  render?: TransferRender<T>;
  showSearch?: boolean;
  filterOption?: TransferFilterOption<T>;
  pagination?: boolean | TransferPaginationConfig;
  oneWay?: boolean;
  operations?: ReactNode[];
  titles?: ReactNode[];
  disabled?: boolean;
  listStyle?: CSSProperties | ((style: { direction: TransferDirection }) => CSSProperties);
  rowKey?: (item: T) => TransferKey;
  locale?: TransferLocale;
  onChange?: (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) => void;
  onSelectChange?: (
    sourceSelectedKeys: TransferKey[],
    targetSelectedKeys: TransferKey[],
  ) => void;
  onSearch?: (direction: TransferDirection, value: string) => void;
}

export type TransferSearchComponent = ForwardRefExoticComponent<
  TransferSearchProps & RefAttributes<HTMLInputElement>
>;

export type TransferOperationComponent = ForwardRefExoticComponent<
  TransferOperationProps & RefAttributes<HTMLDivElement>
>;

export type TransferListComponent = <T extends TransferItem = TransferItem>(
  props: TransferListProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null;

export type TransferComponent = (<T extends TransferItem = TransferItem>(
  props: TransferProps<T> & RefAttributes<HTMLDivElement>,
) => ReactElement | null) & {
  Search: TransferSearchComponent;
  Operation: TransferOperationComponent;
  List: TransferListComponent;
  displayName?: string;
};
