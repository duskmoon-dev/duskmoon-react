import React, { createRef } from "react";
import { expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  ChatComposerConnection,
  ChatComposerContext,
  ChatComposerContextEnd,
  ChatComposerContextItem,
} from "./ChatComposerContext";

test("context forwards refs and attributes while composing Core layout classes", () => {
  const ref = createRef<HTMLDivElement>();
  const itemRef = createRef<HTMLSpanElement>();
  const endRef = createRef<HTMLSpanElement>();
  render(
    <ChatComposerContext ref={ref} className="host-context" data-host="local">
      <ChatComposerContextItem
        ref={itemRef}
        title="workspace/project/src"
        icon={<svg data-testid="workspace-icon" />}
      >
        workspace/project/src
      </ChatComposerContextItem>
      <ChatComposerContextEnd ref={endRef} className="host-end">
        <ChatComposerConnection state="connected" />
      </ChatComposerContextEnd>
    </ChatComposerContext>,
  );
  expect(ref.current).toBe(
    screen.getByRole("group", { name: "Composer context" }),
  );
  expect(ref.current?.className).toBe("chat-composer-context host-context");
  expect(ref.current?.getAttribute("data-host")).toBe("local");
  expect(itemRef.current?.className).toBe("chat-composer-context-item");
  expect(itemRef.current?.title).toBe("workspace/project/src");
  expect(
    itemRef.current?.querySelector(".chat-composer-context-label")?.textContent,
  ).toBe("workspace/project/src");
  expect(
    screen
      .getByTestId("workspace-icon")
      .parentElement?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(endRef.current?.className).toBe("chat-composer-context-end host-end");
});

test("context actions are named native buttons and remain host-controlled", () => {
  let cleared = 0;
  const view = render(
    <form>
      <ChatComposerContextItem
        action={{
          label: "Clear goal",
          onClick: () => cleared++,
          children: <span aria-hidden="true">×</span>,
        }}
      >
        Active goal
      </ChatComposerContextItem>
    </form>,
  );
  const button = screen.getByRole("button", { name: "Clear goal" });
  expect(button.getAttribute("type")).toBe("button");
  fireEvent.click(button);
  expect(cleared).toBe(1);
  expect(screen.getByText("Active goal")).toBeTruthy();

  view.rerender(
    <ChatComposerContextItem
      action={{ label: "Clear goal", onClick: () => cleared++, disabled: true }}
    >
      Active goal
    </ChatComposerContextItem>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Clear goal" }));
  expect(cleared).toBe(1);
});

test("connection state has readable status text and supports localized labels", () => {
  const ref = createRef<HTMLSpanElement>();
  const view = render(<ChatComposerConnection ref={ref} state="connecting" />);
  expect(screen.getByRole("status").textContent).toBe("Connecting");
  expect(ref.current?.getAttribute("data-state")).toBe("connecting");
  view.rerender(<ChatComposerConnection state="disconnected" />);
  expect(screen.getByRole("status").textContent).toBe("Disconnected");
  expect(screen.getByRole("status").getAttribute("data-state")).toBe(
    "disconnected",
  );
  view.rerender(
    <ChatComposerConnection
      state="connected"
      label="已连接"
      className="host-state"
    />,
  );
  expect(screen.getByRole("status").textContent).toBe("已连接");
  expect(screen.getByRole("status").className).toBe(
    "chat-composer-connection host-state",
  );
});
