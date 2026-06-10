import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "./App";

function Action() {
  const app = App.useApp();

  return (
    <>
      <button type="button" onClick={() => app.message.success("Saved")}>
        Message
      </button>
      <button
        type="button"
        onClick={() =>
          app.notification.success({
            message: "Published",
            description: "Ready",
            duration: 0,
          })
        }
      >
        Notify
      </button>
    </>
  );
}

describe("App", () => {
  test("provides message and notification APIs through context", () => {
    render(
      <App>
        <Action />
      </App>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Message" }));
    fireEvent.click(screen.getByRole("button", { name: "Notify" }));

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Published")).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
  });

  test("supports custom root component and className", () => {
    const { container } = render(
      <App component="section" className="custom-app">
        Content
      </App>,
    );

    const root = container.querySelector("section") as HTMLElement;

    expect(root.className).toContain("app");
    expect(root.className).toContain("custom-app");
  });

  test("supports fragment mode", () => {
    const { container } = render(
      <App component={false}>
        <span>Fragment content</span>
      </App>,
    );

    expect(container.querySelector(".app")).toBeNull();
    expect(screen.getByText("Fragment content")).toBeTruthy();
  });
});
