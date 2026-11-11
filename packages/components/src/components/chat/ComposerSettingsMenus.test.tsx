import React from "react";
import { expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { ComposerSettings } from "./ComposerSettings";
import type {
  ComposerSettingsProps,
  ComposerSettingRequest,
  ComposerSettingResult,
} from "./ComposerQueue.types";

function config(
  overrides: Partial<ComposerSettingsProps> = {},
): ComposerSettingsProps {
  return {
    variant: "menu",
    scopeKey: "repo/chat",
    revision: 1,
    settings: [
      {
        id: "access",
        label: "Access",
        value: "ask",
        choices: [
          { value: "ask", label: "Ask" },
          {
            value: "full",
            label: "Full access",
            description: "Allow all actions",
            tone: "warning",
          },
        ],
      },
      {
        id: "model",
        label: "Model",
        value: "fast",
        choices: [
          { value: "fast", label: "Fast" },
          { value: "deep", label: "Deep" },
        ],
      },
      {
        id: "effort",
        label: "Effort",
        value: "low",
        ordered: true,
        defaultValue: "medium",
        choices: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ],
      },
    ],
    groups: [
      {
        id: "access",
        label: "Access settings",
        settingIds: ["access"],
        appearance: "access",
      },
      {
        id: "model",
        label: "Model settings",
        settingIds: ["model", "effort"],
        nestedSettingIds: ["model"],
        appearance: "model",
      },
    ],
    onRequest: async (request) => ({
      ...request,
      revision: 2,
      outcome: "accepted",
      value: request.value,
    }),
    onAcknowledged: () => {},
    ...overrides,
  };
}

test("menu metadata and triggers reflect only host values after acknowledgment", async () => {
  const requests: ComposerSettingRequest[] = [];
  const props = config({
    onRequest: async (request) => {
      requests.push(request);
      return {
        ...request,
        revision: 2,
        outcome: "accepted",
        value: request.value,
      };
    },
  });
  const view = render(<ComposerSettings {...props} />);
  const choice = screen.getByRole("button", {
    name: "Full access Allow all actions",
  });
  expect(choice.className).toContain("chat-composer-menu-option-warning");
  expect(
    screen.getByRole("button", { name: "Ask" }).getAttribute("aria-pressed"),
  ).toBe("true");
  await act(async () => fireEvent.click(choice));
  expect(requests[0].expectedRevision).toBe(1);
  expect(
    screen.getByRole("button", { name: /^Access settings:/ }).textContent,
  ).toContain("Ask");
  expect(
    screen
      .getByRole("button", { name: /^Access settings:/ })
      .getAttribute("data-active"),
  ).toBe("false");
  view.rerender(
    <ComposerSettings
      {...props}
      revision={2}
      settings={props.settings.map((setting) =>
        setting.id === "access" ? { ...setting, value: "full" } : setting,
      )}
    />,
  );
  expect(
    screen
      .getByRole("button", { name: /^Access settings:/ })
      .getAttribute("data-active"),
  ).toBe("true");
});

test("ordered menu previews without requesting until pointer/key release and supports reset", async () => {
  const requests: ComposerSettingRequest[] = [];
  render(
    <ComposerSettings
      {...config({
        onRequest: async (request) => {
          requests.push(request);
          return {
            ...request,
            revision: 2,
            outcome: "accepted",
            value: request.value,
          };
        },
      })}
    />,
  );
  const slider = screen.getByRole("slider", { name: "Effort" });
  fireEvent.change(slider, { target: { value: "2" } });
  expect(slider.getAttribute("aria-valuetext")).toBe("High");
  expect(requests).toHaveLength(0);
  await act(async () => fireEvent.pointerUp(slider));
  expect(requests.map((request) => request.value)).toEqual(["high"]);
  fireEvent.change(slider, { target: { value: "1" } });
  await act(async () => fireEvent.keyUp(slider, { key: "ArrowRight" }));
  expect(requests.map((request) => request.value)).toEqual(["high", "medium"]);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Reset effort" })),
  );
  expect(requests.at(-1)?.value).toBe("medium");
});

test("menu requests serialize and reject stale acknowledgments exactly like select settings", async () => {
  let resolve!: (result: ComposerSettingResult) => void;
  const promise = new Promise<ComposerSettingResult>((yes) => {
    resolve = yes;
  });
  let request!: ComposerSettingRequest;
  let applied = 0;
  let signal!: AbortSignal;
  const props = config({
    onRequest: async (value, abort) => {
      request = value;
      signal = abort;
      return promise;
    },
    onAcknowledged: () => {
      applied++;
    },
  });
  const view = render(<ComposerSettings {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Deep" }));
  expect(
    (
      screen.getByRole("button", {
        name: "Full access Allow all actions",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    (screen.getByRole("slider", { name: "Effort" }) as HTMLInputElement)
      .disabled,
  ).toBe(true);
  expect(screen.getByRole("status").textContent).toContain("pending");
  view.rerender(<ComposerSettings {...props} revision={9} />);
  await act(async () =>
    resolve({ ...request, revision: 2, outcome: "accepted", value: "deep" }),
  );
  expect(applied).toBe(0);
  expect(screen.getByRole("status").textContent).toContain(
    "Current value retained",
  );
  fireEvent.click(screen.getByRole("button", { name: "Deep" }));
  view.rerender(<ComposerSettings {...props} scopeKey="other" />);
  expect(signal.aborted).toBe(true);
});

test("menu rejections announce the host message and retain the current selection", async () => {
  render(
    <ComposerSettings
      {...config({
        onRequest: async (request) => ({
          ...request,
          revision: 2,
          outcome: "rejected",
          message: "Policy denied",
        }),
      })}
    />,
  );
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Deep" })),
  );
  expect(screen.getByRole("status").textContent).toBe("Policy denied");
  expect(
    screen.getByRole("button", { name: /^Model settings:/ }).textContent,
  ).toContain("Fast");
});
