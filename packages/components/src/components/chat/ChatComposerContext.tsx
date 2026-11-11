import React, { forwardRef } from "react";
import type { ComponentProps, MouseEventHandler, ReactNode } from "react";
import { cn } from "../../utils";

export type ChatComposerContextProps = ComponentProps<"div">;

/** Place first inside the composer, or pass through its context slot. */
export const ChatComposerContext = forwardRef<
  HTMLDivElement,
  ChatComposerContextProps
>(({ className, ...props }, ref) => (
  <div
    role="group"
    aria-label="Composer context"
    {...props}
    ref={ref}
    className={cn("chat-composer-context", className)}
  />
));
ChatComposerContext.displayName = "Chat.ComposerContext";

export interface ChatComposerContextItemAction {
  /** Accessible name for the native button, including icon-only actions. */
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  children?: ReactNode;
}

export interface ChatComposerContextItemProps extends ComponentProps<"span"> {
  /** Decorative icon; the item's children supply its readable label. */
  icon?: ReactNode;
  action?: ChatComposerContextItemAction;
}

export const ChatComposerContextItem = forwardRef<
  HTMLSpanElement,
  ChatComposerContextItemProps
>(({ icon, action, children, className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cn("chat-composer-context-item", className)}
  >
    {icon ? (
      <span className="chat-composer-context-icon" aria-hidden="true">
        {icon}
      </span>
    ) : null}
    <span className="chat-composer-context-label">{children}</span>
    {action ? (
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        aria-label={action.label}
        title={action.label}
        disabled={action.disabled}
        onClick={action.onClick}
      >
        {action.children ?? action.label}
      </button>
    ) : null}
  </span>
));
ChatComposerContextItem.displayName = "Chat.ComposerContextItem";

export type ChatComposerContextEndProps = ComponentProps<"span">;

export const ChatComposerContextEnd = forwardRef<
  HTMLSpanElement,
  ChatComposerContextEndProps
>(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cn("chat-composer-context-end", className)}
  />
));
ChatComposerContextEnd.displayName = "Chat.ComposerContextEnd";

export type ChatComposerConnectionState =
  "connected" | "connecting" | "disconnected";

export interface ChatComposerConnectionProps extends Omit<
  ComponentProps<"span">,
  "children"
> {
  state: ChatComposerConnectionState;
  /** Localized visible text, also used as the accessible status name. */
  label?: string;
}

const connectionLabels: Record<ChatComposerConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
};

export const ChatComposerConnection = forwardRef<
  HTMLSpanElement,
  ChatComposerConnectionProps
>(({ state, label, className, ...props }, ref) => (
  <span
    role="status"
    {...props}
    ref={ref}
    data-state={state}
    className={cn("chat-composer-connection", className)}
  >
    {label ?? connectionLabels[state]}
  </span>
));
ChatComposerConnection.displayName = "Chat.ComposerConnection";
