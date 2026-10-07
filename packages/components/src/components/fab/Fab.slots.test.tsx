import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Fab, FabAction } from "./Fab";

describe("Fab", () => {
  test("renders a named single action without a popover", () => {
    const ref = createRef<HTMLDivElement>();
    let clicks = 0;
    const { container } = render(
      <Fab
        ref={ref}
        label="Create note"
        contained
        start
        extended
        buttonProps={{ color: "secondary", onClick: () => clicks++ }}
      >
        Compose
      </Fab>,
    );

    const trigger = screen.getByRole("button", { name: "Create note" });
    expect(ref.current).toBe(container.querySelector(".fab"));
    expect(ref.current?.classList.contains("fab-contained")).toBe(true);
    expect(ref.current?.classList.contains("fab-start")).toBe(true);
    expect(trigger.classList.contains("fab-extended")).toBe(true);
    expect(trigger.classList.contains("btn-secondary")).toBe(true);
    expect(trigger.hasAttribute("popovertarget")).toBe(false);
    expect(container.querySelector(".fab-actions")).toBeNull();
    fireEvent.click(trigger);
    expect(clicks).toBe(1);
  });

  test("connects the trigger to a browser-managed speed dial", () => {
    const { container } = render(
      <Fab
        label="Create"
        actions={
          <FabAction label="New message">
            <ButtonAction />
          </FabAction>
        }
      >
        +
      </Fab>,
    );

    const root = container.querySelector(".fab");
    const trigger = screen.getByRole("button", { name: "Create" });
    const actions = root?.querySelector(":scope > .fab-actions[popover]");

    expect(root?.classList.contains("fab-speed-dial")).toBe(true);
    expect(trigger.getAttribute("popovertarget")).toBe(actions?.id ?? null);
    expect(actions?.getAttribute("popover")).toBe("auto");
    expect(actions?.querySelector(".fab-action .fab-label")?.textContent).toBe(
      "New message",
    );
    expect(
      screen.getByRole("button", { name: "New message action" }),
    ).toBeTruthy();
    expect(root?.classList.contains("fab-controlled")).toBe(false);
  });

  test("keeps the native trigger disabled when requested", () => {
    render(
      <Fab
        label="Create"
        actions={<FabAction>Action</FabAction>}
        buttonProps={{ disabled: true }}
      >
        +
      </Fab>,
    );

    expect(
      screen.getByRole("button", { name: "Create" }).hasAttribute("disabled"),
    ).toBe(true);
  });
});

function ButtonAction() {
  return (
    <button type="button" aria-label="New message action">
      +
    </button>
  );
}
