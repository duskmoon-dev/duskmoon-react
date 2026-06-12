import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type MentionsPlacement = "top" | "bottom";

export interface MentionsOptionType {
  value: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface MentionsProps extends Omit<
  ComponentProps<"textarea">,
  "children" | "defaultValue" | "onChange" | "onSelect" | "prefix" | "value"
> {
  children?: ReactNode;
  defaultValue?: string;
  filterOption?:
    | boolean
    | ((input: string, option: MentionsOptionType) => boolean);
  notFoundContent?: ReactNode;
  onChange?: (value: string) => void;
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: MentionsOptionType, prefix: string) => void;
  options?: MentionsOptionType[];
  placement?: MentionsPlacement;
  prefix?: string | string[];
  split?: string;
  value?: string;
}

export interface MentionsOptionProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  children?: ReactNode;
  disabled?: boolean;
  value: string;
}

export type MentionsComponent = ForwardRefExoticComponent<
  MentionsProps & RefAttributes<HTMLTextAreaElement>
> & {
  Option: ForwardRefExoticComponent<
    MentionsOptionProps & RefAttributes<HTMLDivElement>
  >;
};
