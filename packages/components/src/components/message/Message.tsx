import React, { useSyncExternalStore, type ReactNode } from "react";
import {
  getMessageClasses,
  getMessageHolderClasses,
  messageCloseClass,
  messageContentClass,
  messageIconClass,
} from "../../classes/message";
import type {
  MessageApi,
  MessageArgsProps,
  MessageConfig,
  MessageContent,
  MessageHandle,
  MessageInstance,
  MessageType,
} from "./Message.types";

let seed = 0;
let globalConfig: Required<Pick<MessageConfig, "duration" | "placement">> &
  MessageConfig = {
  duration: 3,
  placement: "top",
};
let messages: MessageInstance[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let snapshot = { messages, config: globalConfig };

function emit() {
  snapshot = { messages, config: globalConfig };
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function normalizeContent(
  type: MessageType,
  content: MessageContent,
  duration?: number,
  onClose?: () => void,
): MessageArgsProps {
  if (
    typeof content === "object" &&
    content !== null &&
    !React.isValidElement(content) &&
    ("content" in content || "type" in content || "key" in content)
  ) {
    return { type, ...content };
  }

  return { type, content: content as ReactNode, duration, onClose };
}

function makeHandle(key: string): MessageHandle {
  const promise = Promise.resolve() as MessageHandle;
  promise.key = key;
  promise.close = () => destroy(key);
  return promise;
}

function clearTimer(key: string) {
  const timer = timers.get(key);
  if (timer) {
    clearTimeout(timer);
    timers.delete(key);
  }
}

function destroy(key?: string | number) {
  if (key === undefined) {
    for (const item of messages) {
      clearTimer(item.key);
      item.onClose?.();
    }
    messages = [];
    emit();
    return;
  }

  const targetKey = String(key);
  const target = messages.find((item) => item.key === targetKey);
  clearTimer(targetKey);
  messages = messages.filter((item) => item.key !== targetKey);
  target?.onClose?.();
  emit();
}

function open(config: MessageArgsProps): MessageHandle {
  const key = String(config.key ?? `message-${(seed += 1)}`);
  const duration = config.duration ?? globalConfig.duration;
  const next: MessageInstance = {
    key,
    type: config.type ?? "info",
    content: config.content,
    duration,
    className: config.className,
    icon: config.icon,
    onClose: config.onClose,
  };

  clearTimer(key);
  messages = messages.filter((item) => item.key !== key).concat(next);

  if (globalConfig.maxCount && messages.length > globalConfig.maxCount) {
    const overflow = messages.slice(0, messages.length - globalConfig.maxCount);
    for (const item of overflow) {
      clearTimer(item.key);
      item.onClose?.();
    }
    messages = messages.slice(-globalConfig.maxCount);
  }

  if (duration > 0) {
    timers.set(
      key,
      setTimeout(() => destroy(key), duration * 1000),
    );
  }

  emit();
  return makeHandle(key);
}

function typedOpen(type: MessageType) {
  return (content: MessageContent, duration?: number, onClose?: () => void) =>
    open(normalizeContent(type, content, duration, onClose));
}

function config(nextConfig: MessageConfig) {
  globalConfig = { ...globalConfig, ...nextConfig };
  emit();
}

export function MessageHolder({ className }: { className?: string }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return (
    <div
      className={getMessageHolderClasses({
        placement: snapshot.config.placement,
        className,
      })}
    >
      {snapshot.messages.map((item) => (
        <div
          key={item.key}
          className={getMessageClasses({
            type: item.type,
            className: item.className,
          })}
        >
          {item.icon ? (
            <span className={messageIconClass}>{item.icon}</span>
          ) : null}
          <span className={messageContentClass}>{item.content}</span>
          <button
            type="button"
            className={messageCloseClass}
            aria-label="Close message"
            onClick={() => destroy(item.key)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

const apiBase = {
  open,
  success: typedOpen("success"),
  error: typedOpen("error"),
  info: typedOpen("info"),
  warning: typedOpen("warning"),
  loading: typedOpen("loading"),
  destroy,
  config,
};

export const message = {
  ...apiBase,
  useMessage: () =>
    [message, <MessageHolder key="message-holder" />] as [
      MessageApi,
      ReactNode,
    ],
} as MessageApi;
