import React, { useId, useRef, useState } from "react";
import { cn } from "../../utils";
import type {
  ComposerSetting,
  ComposerSettingsGroup,
  ComposerSettingsProps,
} from "./ComposerQueue.types";

type MenuProps = ComposerSettingsProps & {
  busy: boolean;
  feedback: Readonly<Record<string, string>>;
  request: (id: string, value: string) => Promise<void>;
};

/** Presentation only: both settings variants use the same request/acknowledgment owner. */
export function ComposerSettingsMenus(props: MenuProps) {
  const groups =
    props.groups ??
    props.settings.map((setting) => ({
      id: setting.id,
      label: setting.label,
      settingIds: [setting.id],
    }));
  return (
    <>
      {groups.map((group) => (
        <SettingsMenu key={group.id} {...props} group={group} />
      ))}
      <span className="sr-only" role="status">
        {props.busy
          ? "Change pending"
          : Object.values(props.feedback).filter(Boolean).join(". ")}
      </span>
    </>
  );
}

function OrderedSetting({
  setting,
  disabled,
  choose,
}: {
  setting: ComposerSetting;
  disabled: boolean;
  choose: (value: string) => void;
}) {
  const current = Math.max(
    0,
    setting.choices.findIndex((choice) => choice.value === setting.value),
  );
  const [draft, setDraft] = useState<number>();
  const value = draft ?? current;
  const commit = () => {
    if (draft !== undefined) choose(setting.choices[draft].value);
    setDraft(undefined);
  };
  return (
    <>
      <div className="chat-composer-menu-row">
        <strong>{setting.choices[value]?.label}</strong>
        {setting.defaultValue !== undefined ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            aria-label={`Reset ${setting.label.toLowerCase()}`}
            disabled={
              disabled ||
              setting.value === setting.defaultValue ||
              !setting.choices.some(
                (choice) =>
                  choice.value === setting.defaultValue &&
                  !choice.unavailableReason,
              )
            }
            onClick={() => choose(setting.defaultValue!)}
          >
            Reset
          </button>
        ) : null}
      </div>
      <label className="chat-composer-menu-field">
        <span className="sr-only">{setting.label}</span>
        <input
          type="range"
          className="range range-sm"
          min={0}
          max={Math.max(0, setting.choices.length - 1)}
          step={1}
          value={value}
          aria-valuetext={setting.choices[value]?.label}
          disabled={disabled || !setting.choices.length}
          onChange={(event) => setDraft(Number(event.currentTarget.value))}
          onPointerUp={commit}
          onKeyUp={(event) => {
            if (
              [
                "ArrowLeft",
                "ArrowRight",
                "ArrowUp",
                "ArrowDown",
                "Home",
                "End",
                "PageUp",
                "PageDown",
              ].includes(event.key)
            )
              commit();
          }}
          onBlur={commit}
          onPointerCancel={() => setDraft(undefined)}
        />
      </label>
      <div className="chat-composer-menu-row chat-composer-description">
        <span>{setting.choices[0]?.label}</span>
        <span>{setting.choices.at(-1)?.label}</span>
      </div>
    </>
  );
}

function SettingsMenu({
  group,
  ...props
}: MenuProps & { group: ComposerSettingsGroup }) {
  const id = useId();
  const anchor = `--settings-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const settings = group.settingIds.flatMap((key) =>
    props.settings.filter((setting) => setting.id === key),
  );
  const warning = settings.some(
    (setting) =>
      setting.choices.find((choice) => choice.value === setting.value)?.tone ===
      "warning",
  );
  function choose(setting: ComposerSetting, value: string) {
    if (
      props.busy ||
      setting.unavailableReason ||
      setting.choices.find((choice) => choice.value === value)
        ?.unavailableReason
    )
      return;
    void props.request(setting.id, value);
    panel.current
      ?.querySelectorAll<HTMLElement>("[popover]")
      .forEach((element) => element.hidePopover?.());
    panel.current?.hidePopover?.();
    trigger.current?.focus({ preventScroll: true });
  }
  function choices(setting: ComposerSetting) {
    return setting.choices.map((choice) => (
      <button
        key={choice.value}
        type="button"
        className={cn(
          "popover-menu-item chat-composer-menu-option",
          choice.tone === "warning" && "chat-composer-menu-option-warning",
        )}
        aria-pressed={setting.value === choice.value}
        disabled={
          props.busy ||
          !!setting.unavailableReason ||
          !!choice.unavailableReason
        }
        onClick={() => choose(setting, choice.value)}
      >
        {choice.icon}
        <span className="chat-composer-label">
          {choice.label}
          {choice.description ? (
            <span className="chat-composer-description">
              {choice.description}
            </span>
          ) : null}
          {choice.unavailableReason ? (
            <span className="chat-composer-description">
              {choice.unavailableReason}
            </span>
          ) : null}
        </span>
        {setting.value === choice.value ? (
          <span aria-hidden="true">✓</span>
        ) : null}
      </button>
    ));
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={cn(
          "btn btn-ghost btn-sm chat-composer-config",
          group.appearance && `chat-composer-${group.appearance}`,
          props.className,
        )}
        data-active={group.appearance === "access" ? warning : undefined}
        aria-label={`${group.label}: ${settings.map((setting) => setting.choices.find((choice) => choice.value === setting.value)?.label ?? setting.value).join(", ")}`}
        title={group.label}
        popoverTarget={id}
        aria-controls={id}
        aria-expanded={open}
        // Opening a menu never mutates settings. Keep its trigger focusable while
        // requests are pending; disable the decision controls inside instead.
        disabled={settings.every((setting) => !!setting.unavailableReason)}
        aria-busy={props.busy || undefined}
        style={{ anchorName: anchor } as React.CSSProperties}
      >
        {group.icon}
        <span className="chat-composer-label">
          {settings.map((setting, index) => (
            <React.Fragment key={setting.id}>
              {index ? " " : null}
              <span
                className={setting.ordered ? "chat-composer-effort" : undefined}
              >
                {setting.choices.find(
                  (choice) => choice.value === setting.value,
                )?.label ?? setting.value}
              </span>
            </React.Fragment>
          ))}
        </span>
        <span aria-hidden="true">⌄</span>
      </button>
      <div
        id={id}
        ref={panel}
        popover="auto"
        role="group"
        aria-label={
          group.appearance === "model"
            ? `Composer ${group.label.toLowerCase()}`
            : group.label
        }
        className={cn(
          "popover popover-menu chat-composer-menu",
          group.appearance === "model" && "chat-composer-menu-end",
        )}
        style={{ positionAnchor: anchor } as React.CSSProperties}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        {settings.map((setting) => (
          <React.Fragment key={setting.id}>
            {setting.ordered ? (
              <OrderedSetting
                key={`${setting.id}-${setting.value}-${props.revision}`}
                setting={setting}
                disabled={props.busy || !!setting.unavailableReason}
                choose={(value) => choose(setting, value)}
              />
            ) : group.nestedSettingIds?.includes(setting.id) ? (
              <NestedSetting
                id={`${id}-${setting.id}`}
                setting={setting}
                disabled={props.busy || !!setting.unavailableReason}
                anchor={anchor}
              >
                {choices(setting)}
              </NestedSetting>
            ) : (
              <>
                <div className="chat-composer-group">{setting.label}</div>
                {choices(setting)}
              </>
            )}
            {setting.unavailableReason ? (
              <p className="chat-composer-description">
                {setting.unavailableReason}
              </p>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function NestedSetting({
  id,
  setting,
  disabled,
  anchor,
  children,
}: {
  id: string;
  setting: ComposerSetting;
  disabled: boolean;
  anchor: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="popover-menu-item"
        aria-label={`Choose a ${setting.label.toLowerCase()}: ${setting.choices.find((choice) => choice.value === setting.value)?.label ?? setting.value}`}
        disabled={disabled}
        popoverTarget={id}
        aria-controls={id}
        aria-expanded={open}
      >
        <span className="chat-composer-label">
          {setting.choices.find((choice) => choice.value === setting.value)
            ?.label ?? setting.value}
        </span>
        <span aria-hidden="true">›</span>
      </button>
      <div
        id={id}
        popover="auto"
        role="group"
        aria-label={`Choose a ${setting.label.toLowerCase()}`}
        className="popover popover-menu chat-composer-menu chat-composer-menu-end"
        style={{ positionAnchor: anchor } as React.CSSProperties}
        onToggle={(event) => setOpen(event.newState === "open")}
      >
        <div className="chat-composer-group">
          Select {setting.label.toLowerCase()}
        </div>
        {children}
      </div>
    </>
  );
}
