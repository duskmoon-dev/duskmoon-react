import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";

export type ChatPlacement = "start" | "end";

export type ChatBubbleColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "neutral"
  | "base"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ChatBubbleSize = "xs" | "sm" | "md" | "lg";

export type ChatToolState = "pending" | "running" | "success" | "error";

export interface ChatProps extends ComponentProps<"div"> {
  /** Position the turn at the start or end of the conversation row. */
  placement?: ChatPlacement;
}

export type ChatAvatarProps = ComponentProps<"div">;
export type ChatHeaderProps = ComponentProps<"div">;
export type ChatFooterProps = ComponentProps<"div">;

export interface ChatBubbleProps extends ComponentProps<"div"> {
  /** Apply a semantic DuskMoon color to the bubble. */
  color?: ChatBubbleColor;
  /** Control the bubble padding and font size. @default "md" */
  size?: ChatBubbleSize;
  /** Use the saturated form of the selected color. */
  filled?: boolean;
  /** Show the live streaming caret after the bubble content. */
  streaming?: boolean;
}

export type ChatReasoningProps = ComponentProps<"details">;

export interface ChatToolProps extends ComponentProps<"details"> {
  /** Reflect the current tool-call state. */
  status?: ChatToolState;
}

export type ChatToolHeaderProps = ComponentProps<"summary">;
export type ChatToolStatusProps = ComponentProps<"span">;
export type ChatToolCallProps = ComponentProps<"div">;
export type ChatToolResultProps = ComponentProps<"div">;

export type ChatTypingProps = Omit<ComponentProps<"span">, "children">;

type ChatPartComponent<T extends HTMLElement, P> = ForwardRefExoticComponent<
  P & RefAttributes<T>
>;

export type ChatComponent = ChatPartComponent<HTMLDivElement, ChatProps> & {
  Avatar: ChatPartComponent<HTMLDivElement, ChatAvatarProps>;
  Header: ChatPartComponent<HTMLDivElement, ChatHeaderProps>;
  Bubble: ChatPartComponent<HTMLDivElement, ChatBubbleProps>;
  Footer: ChatPartComponent<HTMLDivElement, ChatFooterProps>;
  Reasoning: ChatPartComponent<HTMLDetailsElement, ChatReasoningProps>;
  Tool: ChatPartComponent<HTMLDetailsElement, ChatToolProps>;
  ToolHeader: ChatPartComponent<HTMLElement, ChatToolHeaderProps>;
  ToolStatus: ChatPartComponent<HTMLSpanElement, ChatToolStatusProps>;
  ToolCall: ChatPartComponent<HTMLDivElement, ChatToolCallProps>;
  ToolResult: ChatPartComponent<HTMLDivElement, ChatToolResultProps>;
  Typing: ChatPartComponent<HTMLSpanElement, ChatTypingProps>;
};
