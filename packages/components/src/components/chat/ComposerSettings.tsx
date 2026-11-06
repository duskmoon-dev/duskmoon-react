import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { Select } from "../select/Select";
import { cn } from "../../utils";
import type {
  ComposerSettingRequest,
  ComposerSettingsProps,
} from "./ComposerQueue.types";

/** Host-owned choices and values. A click requests a change, never confirms it. */
export function ComposerSettings(props: ComposerSettingsProps) {
  return <SettingsSession key={props.scopeKey} {...props} />;
}

function SettingsSession(props: ComposerSettingsProps) {
  const latest = useRef(props);
  const watermark = useRef(props.revision);
  useLayoutEffect(() => {
    latest.current = props;
    watermark.current = Math.max(watermark.current, props.revision);
  });
  const requests = useRef(new Map<string, AbortController>());
  const nextId = useRef(0);
  const instanceId = useId();
  const [pending, setPending] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const active = requests.current;
    return () => {
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, []);

  async function request(settingId: string, value: string) {
    const owner = latest.current;
    const setting = owner.settings.find((item) => item.id === settingId);
    const choice = setting?.choices.find((item) => item.value === value);
    if (
      !setting ||
      !choice ||
      setting.unavailableReason ||
      choice.unavailableReason ||
      value === setting.value ||
      requests.current.size > 0
    )
      return;
    const controller = new AbortController();
    requests.current.set(settingId, controller);
    setPending([...requests.current.keys()]);
    setFeedback((current) => ({ ...current, [settingId]: "" }));
    const mutation: ComposerSettingRequest = {
      requestId: `${instanceId}-setting-${++nextId.current}`,
      scopeKey: owner.scopeKey,
      settingId,
      expectedRevision: owner.revision,
      value,
    };
    try {
      const result = await owner.onRequest(mutation, controller.signal);
      if (controller.signal.aborted) return;
      if (
        result.requestId !== mutation.requestId ||
        result.settingId !== settingId ||
        result.scopeKey !== mutation.scopeKey ||
        !Number.isSafeInteger(result.revision) ||
        (result.outcome !== "accepted" && result.outcome !== "rejected")
      )
        throw new TypeError("Invalid setting acknowledgment identity");
      if (
        result.revision < Math.max(mutation.expectedRevision, watermark.current)
      ) {
        setFeedback((current) => ({
          ...current,
          [settingId]:
            "Settings changed while the request was pending. Current value retained.",
        }));
        return;
      }
      if (
        result.outcome === "accepted" &&
        !latest.current.settings
          .find((item) => item.id === settingId)
          ?.choices.some((item) => item.value === result.value)
      )
        throw new TypeError("Unknown acknowledged setting value");
      watermark.current = result.revision;
      latest.current.onAcknowledged(result);
      setFeedback((current) => ({
        ...current,
        [settingId]:
          result.outcome === "rejected"
            ? result.message
            : "Change acknowledged; displayed value follows host state",
      }));
    } catch (error) {
      if (!controller.signal.aborted)
        setFeedback((current) => ({
          ...current,
          [settingId]:
            error instanceof Error ? error.message : "Setting change failed",
        }));
    } finally {
      if (requests.current.get(settingId) === controller) {
        requests.current.delete(settingId);
        if (!controller.signal.aborted)
          setPending([...requests.current.keys()]);
      }
    }
  }
  return (
    <div
      className={cn("chat-composer-toolbar", props.className)}
      role="group"
      aria-label={props.label ?? "Composer settings"}
    >
      {props.settings.map((setting) => {
        // All controls share one revision, so only one mutation may be in flight.
        const busy = pending.length > 0;
        const descriptionId = `${instanceId}-${setting.id}-description`;
        const description = busy
          ? "Change pending"
          : feedback[setting.id] || setting.unavailableReason;
        return (
          <div key={setting.id}>
            <Select
              aria-label={setting.label}
              aria-describedby={description ? descriptionId : undefined}
              value={setting.value}
              disabled={Boolean(setting.unavailableReason) || busy}
              size="sm"
              options={setting.choices.map((choice) => ({
                value: choice.value,
                label: choice.unavailableReason
                  ? `${choice.label} — ${choice.unavailableReason}`
                  : choice.label,
                disabled: Boolean(choice.unavailableReason),
              }))}
              onChange={(value) => {
                if (typeof value === "string") void request(setting.id, value);
              }}
            />
            {description ? (
              <p
                id={descriptionId}
                className="chat-composer-status"
                role="status"
              >
                {description}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
