import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Fab } from "./Fab";

describe("Fab", () => {
  test("links a native trigger to its speed-dial popover", () => {
    render(
      <Fab contained speedDial>
        <Fab.Trigger aria-label="Create">+</Fab.Trigger>
        <Fab.Actions>
          <Fab.Action>
            <Fab.Label>New message</Fab.Label>
            <button type="button">Message</button>
          </Fab.Action>
        </Fab.Actions>
      </Fab>,
    );

    const trigger = screen.getByRole("button", { name: "Create" });
    const actions =
      screen.getByText("New message").parentElement?.parentElement;
    expect(trigger.getAttribute("popovertarget")).toBe(actions?.id ?? null);
    expect(actions?.getAttribute("popover")).toBe("auto");
    expect(actions?.className).toContain("fab-actions");
  });

  test("keeps a single-action FAB as a button", () => {
    render(
      <Fab start>
        <Fab.Trigger aria-label="Compose">+</Fab.Trigger>
      </Fab>,
    );
    expect(
      screen
        .getByRole("button", { name: "Compose" })
        .hasAttribute("popovertarget"),
    ).toBe(false);
  });
});
