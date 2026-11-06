import React from "react";
import { expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ComposerSettings } from "./ComposerSettings";
import type {
  ComposerSettingRequest,
  ComposerSettingResult,
  ComposerSettingsProps,
} from "./ComposerQueue.types";
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
function props(
  overrides: Partial<ComposerSettingsProps> = {},
): ComposerSettingsProps {
  return {
    scopeKey: "repo/chat",
    revision: 1,
    settings: [
      {
        id: "model",
        label: "Model",
        value: "fast",
        choices: [
          { value: "fast", label: "Fast" },
          { value: "deep", label: "Deep" },
          {
            value: "offline",
            label: "Offline",
            unavailableReason: "Not available",
          },
        ],
      },
    ],
    onAcknowledged: () => {},
    onRequest: async (request) => ({
      ...request,
      revision: 2,
      outcome: "accepted",
      value: request.value,
    }),
    ...overrides,
  };
}
function selectDeep() {
  fireEvent.click(screen.getByRole("button", { name: "Model" }));
  fireEvent.click(screen.getByRole("option", { name: "Deep" }));
}

test("settings request captures revision and retains authoritative selection through acknowledgment", async () => {
  const pending = deferred<ComposerSettingResult>();
  let request!: ComposerSettingRequest;
  const ack: ComposerSettingResult[] = [];
  const config = props({
    onRequest: async (value) => {
      request = value;
      return pending.promise;
    },
    onAcknowledged: (value) => ack.push(value),
  });
  const view = render(<ComposerSettings {...config} />);
  selectDeep();
  expect(request.value).toBe("deep");
  expect(request.expectedRevision).toBe(1);
  expect(screen.getByRole("button", { name: "Model" }).textContent).toContain(
    "Fast",
  );
  expect(screen.getByRole("status").textContent).toContain("pending");
  await act(async () => {
    pending.resolve({
      ...request,
      revision: 2,
      outcome: "accepted",
      value: "deep",
    });
  });
  expect(ack).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Model" }).textContent).toContain(
    "Fast",
  );
  view.rerender(
    <ComposerSettings
      {...config}
      revision={2}
      settings={[{ ...config.settings[0], value: "deep" }]}
    />,
  );
  expect(screen.getByRole("button", { name: "Model" }).textContent).toContain(
    "Deep",
  );
});

test("unavailable options and rejected changes preserve host value and show reason", async () => {
  const results: ComposerSettingResult[] = [];
  render(
    <ComposerSettings
      {...props({
        onAcknowledged: (result) => results.push(result),
        onRequest: async (request) => ({
          ...request,
          revision: 2,
          outcome: "rejected",
          message: "Host policy changed",
        }),
      })}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Model" }));
  expect(
    (
      screen.getByRole("option", {
        name: "Offline — Not available",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  await act(async () => {
    fireEvent.click(screen.getByRole("option", { name: "Deep" }));
  });
  expect(results[0].outcome).toBe("rejected");
  expect(screen.getByRole("status").textContent).toBe("Host policy changed");
  expect(screen.getByRole("button", { name: "Model" }).textContent).toContain(
    "Fast",
  );
});

test("newer settings/reconnect snapshot wins and scope switch aborts late acknowledgments", async () => {
  const pending = deferred<ComposerSettingResult>();
  let request!: ComposerSettingRequest;
  let signal!: AbortSignal;
  let applies = 0;
  const config = props({
    onAcknowledged: () => {
      applies++;
    },
    onRequest: async (value, abort) => {
      request = value;
      signal = abort;
      return pending.promise;
    },
  });
  const view = render(<ComposerSettings {...config} />);
  selectDeep();
  view.rerender(<ComposerSettings {...config} revision={8} />);
  await act(async () => {
    pending.resolve({
      ...request,
      revision: 2,
      outcome: "accepted",
      value: "deep",
    });
  });
  expect(applies).toBe(0);
  expect(screen.getByRole("status").textContent).toContain(
    "Current value retained",
  );
  selectDeep();
  view.rerender(<ComposerSettings {...config} scopeKey="other" />);
  expect(signal.aborted).toBe(true);
});

test("malformed acknowledgment identity never confirms a setting", async () => {
  let applies = 0;
  render(
    <ComposerSettings
      {...props({
        onAcknowledged: () => {
          applies++;
        },
        onRequest: async (request) => ({
          ...request,
          requestId: "wrong",
          revision: 2,
          outcome: "accepted",
          value: "deep",
        }),
      })}
    />,
  );
  selectDeep();
  await act(async () => {});
  expect(applies).toBe(0);
  expect(screen.getByRole("status").textContent).toContain(
    "Invalid setting acknowledgment identity",
  );
});

test("settings sharing one authoritative revision serialize requests across controls", async () => {
  const pending = deferred<ComposerSettingResult>();
  const requests: ComposerSettingRequest[] = [];
  const acknowledged: ComposerSettingResult[] = [];
  const config = props();
  render(
    <ComposerSettings
      {...config}
      settings={[
        ...config.settings,
        {
          id: "mode",
          label: "Mode",
          value: "ask",
          choices: [
            { value: "ask", label: "Ask" },
            { value: "plan", label: "Plan" },
          ],
        },
      ]}
      onRequest={async (request) => {
        requests.push(request);
        return pending.promise;
      }}
      onAcknowledged={(result) => acknowledged.push(result)}
    />,
  );
  selectDeep();
  const mode = screen.getByRole("button", { name: "Mode" });
  expect((mode as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(mode);
  expect(screen.queryByRole("option", { name: "Plan" })).toBeNull();
  expect(requests).toHaveLength(1);
  await act(async () => {
    pending.resolve({
      ...requests[0],
      revision: 2,
      outcome: "accepted",
      value: "deep",
    });
  });
  expect(acknowledged).toHaveLength(1);
  expect((mode as HTMLButtonElement).disabled).toBe(false);
});
