import React, { useLayoutEffect, useRef } from "react";
import type { ChatComposerCompletion } from "../Chat.types";

export function completionOptionId(composerId: string, candidateId: string) {
  return `${composerId}-option-${encodeURIComponent(candidateId)}`;
}

export function CompletionList({
  composerId,
  label,
  candidates,
  activeId,
  onSelect,
  compact = false,
  anchorName,
  header,
  status,
  onDismiss,
}: {
  composerId: string;
  label: string;
  candidates: readonly ChatComposerCompletion[];
  activeId?: string;
  onSelect: (item: ChatComposerCompletion) => void;
  compact?: boolean;
  anchorName?: string;
  header?: React.ReactNode;
  status?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (compact) surface.current?.showPopover?.();
  }, [compact]);
  useLayoutEffect(() => {
    const tray = surface.current;
    const option = tray?.querySelector('[aria-selected="true"]');
    if (!compact || !tray || !option) return;
    const bounds = tray.getBoundingClientRect();
    const selected = option.getBoundingClientRect();
    const top = bounds.top + tray.clientTop;
    const bottom = top + tray.clientHeight;
    if (selected.top < top) tray.scrollTop += selected.top - top;
    else if (selected.bottom > bottom)
      tray.scrollTop += selected.bottom - bottom;
  }, [compact, activeId, candidates]);
  const list = candidates.length ? (
    <ul
      id={`${composerId}-completions`}
      role="listbox"
      aria-label={label}
      className={
        compact ? "chat-composer-completion-list" : "chat-composer-completions"
      }
    >
      {candidates.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.group && candidates[index - 1]?.group !== item.group ? (
            <li
              role="presentation"
              className="chat-composer-group"
              aria-hidden="true"
            >
              {item.group}
            </li>
          ) : null}
          <li
            id={completionOptionId(composerId, item.id)}
            className={
              compact
                ? "chat-composer-option chat-composer-option-compact"
                : "chat-composer-option"
            }
            role="option"
            aria-label={item.group ? `${item.group}: ${item.label}` : undefined}
            aria-selected={item.id === activeId}
            aria-disabled={item.disabled || undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (!item.disabled) onSelect(item);
            }}
            onKeyDown={(event) => {
              if (
                !item.disabled &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onSelect(item);
              }
            }}
          >
            {compact && item.icon ? (
              <span className="chat-composer-option-icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span
              className={compact ? "chat-composer-label" : undefined}
              title={item.label}
            >
              {item.label}
            </span>
            {item.description ? (
              <span
                className={
                  compact
                    ? "chat-composer-description chat-composer-option-description"
                    : "chat-composer-description"
                }
                title={
                  typeof item.description === "string"
                    ? item.description
                    : undefined
                }
              >
                {item.description}
              </span>
            ) : null}
            {compact && item.sourceLabel ? (
              <span className="chat-composer-description chat-composer-option-source">
                {item.sourceLabel}
              </span>
            ) : null}
          </li>
        </React.Fragment>
      ))}
    </ul>
  ) : null;
  return compact ? (
    <div
      ref={surface}
      popover="auto"
      className="chat-composer-completions chat-composer-completions-compact"
      style={{ positionAnchor: anchorName } as React.CSSProperties}
      onToggle={(event) => {
        if (event.newState === "closed") onDismiss?.();
      }}
    >
      {header}
      {list}
      {status}
    </div>
  ) : (
    <>
      {header}
      {status}
      {list}
    </>
  );
}
