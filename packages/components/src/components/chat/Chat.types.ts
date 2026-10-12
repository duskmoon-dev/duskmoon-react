import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
  ReactNode,
} from "react";

import type { TextAreaProps } from "../input";

export type ChatPlacement = "start" | "end";
export type ChatTimeline =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;

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
  /** Pair an assistant row with a scroll indicator (slots 1–24). */
  timeline?: ChatTimeline;
  "data-chat-tl"?: string | number;
}

export type ChatAvatarProps = ComponentProps<"div">;
export type ChatHeaderProps = ComponentProps<"div">;
export type ChatFooterProps = ComponentProps<"div">;
export type ChatStatusProps = ComponentProps<"div">;
export type ChatStatusItemProps = ComponentProps<"span">;
export type ChatStatusValueProps = ComponentProps<"span">;
export interface ChatActionsProps extends ComponentProps<"div"> {
  /** Reveal actions on message hover or keyboard focus. */
  hover?: boolean;
}
export type ChatScrollProps = ComponentProps<"div">;
export type ChatScrollBodyProps = ComponentProps<"div">;
export type ChatScrollTrackProps = ComponentProps<"div">;
export interface ChatScrollIndicatorProps extends ComponentProps<"button"> {
  targetId: string;
  timeline: ChatTimeline;
}

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

/** A snapshot of the controlled draft at submission time. */
export interface ChatComposerSubmission {
  value: string;
  files: File[];
}

export interface ChatComposerCompletion {
  id: string;
  label: string;
  description?: ReactNode;
  disabled?: boolean;
}

export interface ChatComposerCompletionContext {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/** The application supplies candidates and owns inserting the selected result. */
export interface ChatComposerCompletionConfig {
  items: readonly ChatComposerCompletion[];
  onSelect: (
    item: ChatComposerCompletion,
    context: ChatComposerCompletionContext,
  ) => void;
  label?: string;
}

export interface ChatComposerActionContext {
  submit: () => void;
  submitting: boolean;
  canSubmit: boolean;
  disabled: boolean;
  generating: boolean;
  openAttachments: () => void;
}

export interface ChatComposerAttachmentContext {
  remove: () => void;
  disabled: boolean;
}

export interface ChatComposerProps extends Omit<
  ComponentProps<"div">,
  "children" | "onSubmit" | "onChange"
> {
  value: string;
  onValueChange: (value: string) => void;
  /** Return false to reject admission and retain the draft. */
  onSubmit: (
    snapshot: ChatComposerSubmission,
  ) => boolean | void | Promise<boolean | void>;
  attachments?: File[];
  /** Enables the native file picker and attachment removal controls. */
  onAttachmentsChange?: (files: File[]) => void;
  accept?: string;
  /** @default true */
  multiple?: boolean;
  /** Permit a draft containing only files. @default false */
  allowAttachmentOnly?: boolean;
  disabled?: boolean;
  /** Gates submission while keeping the draft editable. */
  busy?: boolean;
  /** Shows Stop when onStop is supplied; does not prevent submission. */
  generating?: boolean;
  /** Application-controlled admission, including follow-ups. @default true */
  canSubmit?: boolean;
  onStop?: () => void;
  error?: ReactNode;
  onSubmitError?: (error: unknown) => void;
  /** Clear unchanged admitted text and only admitted file entries. @default true */
  clearOnSubmit?: boolean;
  completion?: ChatComposerCompletionConfig;
  /** @default 1 */
  minRows?: number;
  /** @default 6 */
  maxRows?: number;
  textareaProps?: Omit<
    TextAreaProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "disabled"
    | "rows"
    | "autoSize"
    | "ref"
  >;
  attachLabel?: string;
  sendLabel?: string;
  stopLabel?: string;
  renderAttachment?: (
    file: File,
    context: ChatComposerAttachmentContext,
  ) => ReactNode;
  /** Extra application actions rendered alongside Attach, Stop, and Send. */
  children?: ReactNode | ((context: ChatComposerActionContext) => ReactNode);
}

type ChatPartComponent<T extends HTMLElement, P> = ForwardRefExoticComponent<
  P & RefAttributes<T>
>;

export type ChatComponent = ChatPartComponent<HTMLDivElement, ChatProps> & {
  Composer: ChatPartComponent<HTMLDivElement, ChatComposerProps>;
  Avatar: ChatPartComponent<HTMLDivElement, ChatAvatarProps>;
  Header: ChatPartComponent<HTMLDivElement, ChatHeaderProps>;
  Bubble: ChatPartComponent<HTMLDivElement, ChatBubbleProps>;
  Footer: ChatPartComponent<HTMLDivElement, ChatFooterProps>;
  Status: ChatPartComponent<HTMLDivElement, ChatStatusProps>;
  StatusItem: ChatPartComponent<HTMLSpanElement, ChatStatusItemProps>;
  StatusValue: ChatPartComponent<HTMLSpanElement, ChatStatusValueProps>;
  Actions: ChatPartComponent<HTMLDivElement, ChatActionsProps>;
  Scroll: ChatPartComponent<HTMLDivElement, ChatScrollProps>;
  ScrollBody: ChatPartComponent<HTMLDivElement, ChatScrollBodyProps>;
  ScrollTrack: ChatPartComponent<HTMLDivElement, ChatScrollTrackProps>;
  ScrollIndicator: ChatPartComponent<
    HTMLButtonElement,
    ChatScrollIndicatorProps
  >;
  Reasoning: ChatPartComponent<HTMLDetailsElement, ChatReasoningProps>;
  Tool: ChatPartComponent<HTMLDetailsElement, ChatToolProps>;
  ToolHeader: ChatPartComponent<HTMLElement, ChatToolHeaderProps>;
  ToolStatus: ChatPartComponent<HTMLSpanElement, ChatToolStatusProps>;
  ToolCall: ChatPartComponent<HTMLDivElement, ChatToolCallProps>;
  ToolResult: ChatPartComponent<HTMLDivElement, ChatToolResultProps>;
  Typing: ChatPartComponent<HTMLSpanElement, ChatTypingProps>;
};
