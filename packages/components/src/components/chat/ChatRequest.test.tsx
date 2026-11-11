import React, { createRef } from "react";
import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatRequest, type ChatRequestState } from "./ChatRequest";

test("requests preserve host action order and stay unresolved after a choice", () => {
  const decisions: string[] = [];
  const { container } = render(
    <ChatRequest
      title="Run a command?"
      actions={[
        {
          id: "session",
          label: "Approve for session",
          onSelect: () => decisions.push("session"),
        },
        {
          id: "approve",
          label: "Approve",
          tone: "primary",
          onSelect: () => decisions.push("approve"),
        },
        {
          id: "decline",
          label: "Decline",
          tone: "danger",
          onSelect: () => decisions.push("decline"),
        },
      ]}
    >
      <pre>npm test</pre>
    </ChatRequest>,
  );
  const buttons = screen.getAllByRole("button");
  expect(buttons.map((button) => button.textContent)).toEqual([
    "Approve for session",
    "Approve",
    "Decline",
  ]);
  expect(buttons[1].classList.contains("btn-primary")).toBe(true);
  expect(buttons[2].classList.contains("btn-error")).toBe(true);
  fireEvent.click(buttons[1]);
  expect(decisions).toEqual(["approve"]);
  expect(container.firstElementChild?.getAttribute("data-state")).toBe(
    "pending",
  );
  expect(screen.getByRole("status").textContent).toBe("Awaiting approval");
  expect(screen.getByText("npm test")).toBeTruthy();
});

test("host pending state disables every decision and announces progress", () => {
  let calls = 0;
  const { container } = render(
    <ChatRequest
      title="Apply changes?"
      pending
      actions={[
        { id: "yes", label: "Approve", onSelect: () => calls++ },
        { id: "no", label: "Decline", onSelect: () => calls++ },
      ]}
    />,
  );
  for (const button of screen.getAllByRole("button")) {
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
  }
  expect(calls).toBe(0);
  expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("Decision pending");
  expect(status.getAttribute("aria-live")).toBe("polite");
});

test.each([
  ["approved", "Approved"],
  ["approved-for-session", "Approved for this session"],
  ["declined", "Declined"],
  ["expired", "Expired"],
  ["answer-elsewhere", "Answer elsewhere"],
] as const)(
  "%s requests retain details and expose no actions",
  (state, label) => {
    render(
      <ChatRequest
        title="Run npm test?"
        state={state}
        explanation="Managed by another client."
        actions={[{ id: "approve", label: "Approve", onSelect: () => {} }]}
      >
        <code>npm test</code>
      </ChatRequest>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe(label);
    expect(screen.getByText("Managed by another client.")).toBeTruthy();
    expect(screen.getByText("npm test")).toBeTruthy();
  },
);

test("host updates never steal composer focus", () => {
  const view = render(
    <>
      <textarea aria-label="Composer" />
      <ChatRequest title="Run tests?" />
    </>,
  );
  const composer = screen.getByRole("textbox");
  composer.focus();
  view.rerender(
    <>
      <textarea aria-label="Composer" />
      <ChatRequest title="Run tests?" state="approved" />
    </>,
  );
  expect(document.activeElement).toBe(composer);
});

test("resolving the focused decision retains focus on its request without scrolling", () => {
  const ref = createRef<HTMLDivElement>();
  const request = (state: ChatRequestState) => (
    <ChatRequest
      ref={ref}
      title="Run tests?"
      state={state}
      actions={[{ id: "approve", label: "Approve", onSelect: () => {} }]}
    />
  );
  const view = render(request("pending"));
  screen.getByRole("button", { name: "Approve" }).focus();
  view.rerender(request("approved"));
  expect(document.activeElement).toBe(ref.current);
  expect(ref.current).toBe(screen.getByRole("group", { name: "Run tests?" }));
});

test("host labels and individually unavailable actions remain accessible", () => {
  render(
    <ChatRequest
      title="Apply changes?"
      statusLabel="Waiting for project owner"
      actions={[
        {
          id: "approve",
          label: <span>✓</span>,
          ariaLabel: "Approve these changes",
          disabled: true,
          onSelect: () => {},
        },
      ]}
    />,
  );
  expect(screen.getByRole("status").textContent).toBe(
    "Waiting for project owner",
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Approve these changes",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
});
