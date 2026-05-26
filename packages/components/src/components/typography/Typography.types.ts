import type {
  ComponentProps,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type TypographyStatus = "secondary" | "success" | "warning" | "danger";
export type TypographySize = "sm" | "md" | "lg";
export type TypographyLevel = 1 | 2 | 3 | 4 | 5;
export type TypographyCopyFormat = "text/plain" | "text/html";

export interface TypographyEditableConfig {
  editing?: boolean;
  icon?: ReactNode;
  tooltip?: ReactNode;
  triggerType?: "icon" | "text" | Array<"icon" | "text">;
  enterIcon?: ReactNode;
  text?: string;
  maxLength?: number;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  onStart?: () => void;
  onChange?: (value: string) => void;
  onCancel?: () => void;
  onEnd?: () => void;
}

export interface TypographyCopyableConfig {
  text?: string;
  icon?: ReactNode | [ReactNode, ReactNode];
  tooltips?: false | ReactNode | [ReactNode, ReactNode];
  format?: TypographyCopyFormat;
  onCopy?: (event?: ClipboardEvent | React.MouseEvent<HTMLElement>) => void;
}

export interface TypographyEllipsisConfig {
  rows?: number;
  expandable?: boolean | "collapsible";
  suffix?: string;
  symbol?: ReactNode | ((expanded: boolean) => ReactNode);
  tooltip?: ReactNode;
  onExpand?: (
    event: React.MouseEvent<HTMLElement>,
    info: { expanded: boolean },
  ) => void;
  onEllipsis?: (ellipsis: boolean) => void;
}

export type TypographyEditable = boolean | TypographyEditableConfig;
export type TypographyCopyable = boolean | TypographyCopyableConfig;
export type TypographyEllipsis = boolean | TypographyEllipsisConfig;

export interface TypographySemanticProps {
  type?: TypographyStatus;
  disabled?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  underline?: boolean;
  delete?: boolean;
  strong?: boolean;
  italic?: boolean;
}

export interface TypographyBehaviorProps {
  editable?: TypographyEditable;
  copyable?: TypographyCopyable;
  ellipsis?: TypographyEllipsis;
}

export type TypographyProps = ComponentProps<"div">;

export interface TextProps
  extends Omit<ComponentProps<"span">, "color">,
    TypographySemanticProps,
    TypographyBehaviorProps {
  size?: TypographySize;
}

export interface ParagraphProps
  extends Omit<ComponentProps<"p">, "color">,
    TypographySemanticProps,
    TypographyBehaviorProps {}

export interface TitleProps
  extends Omit<ComponentProps<"h1">, "color">,
    TypographySemanticProps,
    TypographyBehaviorProps {
  level?: TypographyLevel;
}

export interface LinkProps
  extends Omit<ComponentProps<"a">, "color" | "type">,
    TypographySemanticProps {
  ellipsis?: TypographyEllipsis;
}

export type TextComponent = ForwardRefExoticComponent<
  TextProps & RefAttributes<HTMLSpanElement>
>;

export type ParagraphComponent = ForwardRefExoticComponent<
  ParagraphProps & RefAttributes<HTMLParagraphElement>
>;

export type TitleComponent = ForwardRefExoticComponent<
  TitleProps & RefAttributes<HTMLHeadingElement>
>;

export type LinkComponent = ForwardRefExoticComponent<
  LinkProps & RefAttributes<HTMLAnchorElement>
>;

export type TypographyComponent = ForwardRefExoticComponent<
  TypographyProps & RefAttributes<HTMLDivElement>
> & {
  Text: TextComponent;
  Title: TitleComponent;
  Paragraph: ParagraphComponent;
  Link: LinkComponent;
};
