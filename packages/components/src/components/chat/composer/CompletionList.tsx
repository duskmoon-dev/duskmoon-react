import React from "react";
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
}: {
  composerId: string;
  label: string;
  candidates: readonly ChatComposerCompletion[];
  activeId?: string;
  onSelect: (item: ChatComposerCompletion) => void;
}) {
  return (
    <ul
      id={`${composerId}-completions`}
      role="listbox"
      aria-label={label}
      className="chat-composer-completions"
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
            className="chat-composer-option"
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
            <span>{item.label}</span>
            {item.description ? (
              <span className="chat-composer-description">
                {item.description}
              </span>
            ) : null}
          </li>
        </React.Fragment>
      ))}
    </ul>
  );
}
