import React, { useEffect, useId, useRef, useState } from "react";
import { Popover } from "@duskmoon-dev/components/popover";
import { Popconfirm } from "@duskmoon-dev/components/popconfirm";
import { Tooltip } from "@duskmoon-dev/components/tooltip";

export function TooltipInterestPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-overlay-tooltip-demo
      style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}
    >
      <Tooltip
        title="Review the project settings before publishing."
        onOpenChange={setOpen}
      >
        <button className="btn btn-outlined" type="button">
          Review settings
        </button>
      </Tooltip>
      <p role="status" aria-atomic="true">
        Tooltip is {open ? "open" : "closed"}.
      </p>
    </div>
  );
}

export function PopoverFormPreview() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState("DuskMoon");
  const [status, setStatus] = useState("No changes saved yet.");
  const fieldId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      data-overlay-form-demo
      style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}
    >
      <Popover
        title="Project settings"
        trigger="click"
        placement="bottom"
        open={open}
        onOpenChange={setOpen}
        destroyTooltipOnHide
        content={
          <form
            aria-label="Project settings"
            onSubmit={(event) => {
              event.preventDefault();
              const value = String(
                new FormData(event.currentTarget).get("project"),
              );
              setSaved(value);
              setStatus(`Saved project: ${value}`);
              close();
            }}
            style={{ display: "grid", gap: "0.75rem" }}
          >
            <label htmlFor={fieldId}>Project name</label>
            <input
              className="input"
              id={fieldId}
              name="project"
              defaultValue={saved}
              required
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-primary btn-sm" type="submit">
                Save project
              </button>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => {
                  setStatus("Changes canceled.");
                  close();
                }}
              >
                Cancel changes
              </button>
            </div>
          </form>
        }
      >
        <button ref={triggerRef} className="btn btn-outlined" type="button">
          Edit project
        </button>
      </Popover>
      <p role="status" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}

export function PopconfirmAsyncPreview() {
  const [shouldReject, setShouldReject] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(0);
  const [canceled, setCanceled] = useState(0);
  const [status, setStatus] = useState(
    "Choose whether the next simulated request succeeds.",
  );
  const timerRef = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function confirm() {
    setPending(true);
    setStatus("Confirming deletion…");
    try {
      await new Promise<void>((resolve) => {
        timerRef.current = window.setTimeout(resolve, 300);
      });
      if (shouldReject) {
        setShouldReject(false);
        setStatus(
          "Request rejected. The confirmation remains available; retry or cancel.",
        );
        throw new Error("Simulated request rejection");
      }
      setConfirmed((count) => count + 1);
      setStatus("Deletion confirmed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      data-overlay-confirm-demo
      style={{ display: "grid", gap: "0.75rem", justifyItems: "start" }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          className="checkbox"
          type="checkbox"
          checked={shouldReject}
          disabled={pending}
          onChange={(event) => setShouldReject(event.currentTarget.checked)}
        />
        Reject next request
      </label>
      <Popconfirm
        title="Delete this draft?"
        description="A simulated request takes a moment. A rejection keeps these actions available."
        placement="bottom"
        okText="Delete draft"
        cancelText="Keep draft"
        cancelButtonProps={{ disabled: pending }}
        onConfirm={confirm}
        onCancel={() => {
          setCanceled((count) => count + 1);
          setStatus("Deletion canceled.");
        }}
      >
        <button className="btn btn-outlined" type="button">
          Review draft deletion
        </button>
      </Popconfirm>
      <p role="status" aria-atomic="true">
        {status}
      </p>
      <p>
        Confirmed: {confirmed} · Canceled: {canceled}
      </p>
    </div>
  );
}
