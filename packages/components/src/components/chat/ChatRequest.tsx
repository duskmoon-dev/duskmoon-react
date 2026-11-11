import React, {
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { cn } from "../../utils";

export type ChatRequestState =
  | "pending"
  | "approved"
  | "approved-for-session"
  | "declined"
  | "expired"
  | "answer-elsewhere";

export interface ChatRequestAction {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly ariaLabel?: string;
  readonly tone?: "primary" | "danger";
  readonly disabled?: boolean;
  readonly onSelect: () => void;
}

export interface ChatRequestProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  readonly title: React.ReactNode;
  readonly state?: ChatRequestState;
  /** Host-owned decision in flight; does not resolve the request. */
  readonly pending?: boolean;
  readonly statusLabel?: string;
  readonly actions?: readonly ChatRequestAction[];
  /** Host explanation, including where an unanswerable request can be answered. */
  readonly explanation?: React.ReactNode;
}

const stateLabels: Record<ChatRequestState, string> = {
  pending: "Awaiting approval",
  approved: "Approved",
  "approved-for-session": "Approved for this session",
  declined: "Declined",
  expired: "Expired",
  "answer-elsewhere": "Answer elsewhere",
};

/** Timeline presentation only. The host owns decisions, pending state and results. */
export const ChatRequest = forwardRef<HTMLDivElement, ChatRequestProps>(
  (
    {
      title,
      state = "pending",
      pending = false,
      statusLabel,
      actions = [],
      explanation,
      children,
      className,
      onFocusCapture,
      onBlurCapture,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const root = useRef<HTMLDivElement>(null);
    const focusedAction = useRef<HTMLElement | null>(null);
    useImperativeHandle(ref, () => root.current!, []);
    useLayoutEffect(() => {
      const element = root.current;
      const action = focusedAction.current;
      // Only restore focus lost by removing this request's focused action.
      // Incoming requests and host updates never move focus out of the composer.
      if (
        element &&
        action &&
        !element.contains(action) &&
        document.activeElement === document.body
      ) {
        element.focus({ preventScroll: true });
        focusedAction.current = null;
      }
    });

    return (
      <div
        {...props}
        ref={root}
        className={cn("chat-approval", className)}
        data-state={state}
        role={props.role ?? "group"}
        tabIndex={props.tabIndex ?? -1}
        aria-labelledby={props["aria-labelledby"] ?? `${id}-title`}
        aria-busy={pending}
        onFocusCapture={(event) => {
          const target = event.target as HTMLElement;
          focusedAction.current = target.closest("[data-chat-request-action]");
          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          if (event.relatedTarget) focusedAction.current = null;
          onBlurCapture?.(event);
        }}
      >
        <div className="chat-approval-header">
          <div id={`${id}-title`} className="chat-approval-title">
            {title}
          </div>
          <span
            className="chat-approval-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {statusLabel ??
              (state === "pending" && pending
                ? "Decision pending"
                : stateLabels[state])}
          </span>
        </div>
        {children != null || explanation != null ? (
          <div className="chat-approval-details">
            {children}
            {explanation}
          </div>
        ) : null}
        {state === "pending" && actions.length > 0 ? (
          <div className="chat-approval-actions">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                data-chat-request-action=""
                className={cn(
                  "btn btn-sm",
                  action.tone === "primary" && "btn-primary",
                  action.tone === "danger" && "btn-error",
                )}
                aria-label={action.ariaLabel}
                disabled={pending || action.disabled}
                onClick={action.onSelect}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  },
);
ChatRequest.displayName = "Chat.Request";
