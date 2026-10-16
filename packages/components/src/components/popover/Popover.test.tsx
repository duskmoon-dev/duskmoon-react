import React from "react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Popover } from "./Popover";

function getSurface() {
  return document.querySelector<HTMLElement>(".popover[popover]")!;
}

describe("Popover", () => {
  const originalMatches = HTMLElement.prototype.matches;
  const originalShowPopover = HTMLElement.prototype.showPopover;
  const originalHidePopover = HTMLElement.prototype.hidePopover;

  beforeEach(() => {
    HTMLElement.prototype.matches = function (
      this: HTMLElement,
      selector: string,
    ) {
      if (selector === ":popover-open") {
        return this.hasAttribute("data-native-open");
      }
      return originalMatches.call(this, selector);
    } as typeof HTMLElement.prototype.matches;
    HTMLElement.prototype.showPopover = function () {
      this.setAttribute("data-native-open", "");
    };
    HTMLElement.prototype.hidePopover = function () {
      this.removeAttribute("data-native-open");
    };
  });

  afterEach(() => {
    HTMLElement.prototype.matches = originalMatches;
    HTMLElement.prototype.showPopover = originalShowPopover;
    HTMLElement.prototype.hidePopover = originalHidePopover;
  });

  test("renders title/content when hover opens and closes", () => {
    render(
      <Popover title="Info" content="Hello" trigger="hover">
        <button type="button">Target</button>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Target" });

    const surface = getSurface();
    expect(surface.getAttribute("popover")).toBe("auto");
    expect(surface.hasAttribute("data-native-open")).toBe(false);

    fireEvent.mouseEnter(trigger);
    expect(surface.hasAttribute("data-native-open")).toBe(true);
    expect(trigger.parentElement?.style.anchorName).toMatch(/^--dm-popover-/);
    expect(trigger.parentElement?.style.anchorName).toBe(
      surface.style.positionAnchor,
    );

    fireEvent.mouseLeave(trigger);
    expect(surface.hasAttribute("data-native-open")).toBe(false);
  });

  test("supports destroy-on-hide behavior", () => {
    render(
      <Popover content="hidden" destroyTooltipOnHide trigger="click">
        <button type="button">Target</button>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Target" });

    expect(document.querySelector(".popover[popover]")).toBeNull();

    fireEvent.click(trigger);
    expect(getSurface().hasAttribute("data-native-open")).toBe(true);

    fireEvent.click(trigger);
    expect(document.querySelector(".popover[popover]")).toBeNull();
  });

  test("supports controlled open state", () => {
    render(
      <Popover title="Controlled" content="Yes" open={true}>
        <button type="button">Target</button>
      </Popover>,
    );

    expect(screen.getByText("Controlled")).toBeTruthy();
    expect(getSurface().hasAttribute("data-native-open")).toBe(true);
  });

  test("reports native light dismissal", () => {
    const changes: boolean[] = [];
    render(
      <Popover
        content="Details"
        defaultOpen
        onOpenChange={(next) => changes.push(next)}
      >
        <button type="button">Target</button>
      </Popover>,
    );

    const surface = getSurface();
    surface.removeAttribute("data-native-open");
    fireEvent(
      surface,
      Object.assign(new Event("toggle", { bubbles: true }), {
        newState: "closed",
      }),
    );

    expect(changes).toEqual([false]);
    expect(
      screen
        .getByRole("button", { name: "Target" })
        .hasAttribute("aria-describedby"),
    ).toBe(false);
  });

  test("keeps rich form controls semantic and preserves the trigger description", () => {
    let submitted = "";
    render(
      <>
        <p id="action-help">Change your display name</p>
        <Popover
          defaultOpen
          trigger="click"
          content={
            <form
              aria-label="Profile settings"
              onSubmit={(event) => {
                event.preventDefault();
                submitted = String(
                  new FormData(event.currentTarget).get("name"),
                );
              }}
            >
              <label>
                Display name
                <input name="name" defaultValue="Luna" />
              </label>
              <button type="submit">Save profile</button>
            </form>
          }
        >
          <button type="button" aria-describedby="action-help">
            Edit profile
          </button>
        </Popover>
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Edit profile" });
    const field = screen.getByRole("textbox", { name: "Display name" });
    const save = screen.getByRole("button", { name: "Save profile" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(getSurface().hasAttribute("role")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe("action-help");

    fireEvent.change(field, { target: { value: "Moon" } });
    fireEvent.click(save);

    expect(submitted).toBe("Moon");
    expect(getSurface().hasAttribute("data-native-open")).toBe(true);
  });

  test("does not describe a trigger with the complete interactive surface", () => {
    render(
      <Popover
        defaultOpen
        content={<button type="button">Apply filters</button>}
      >
        <button type="button">Filters</button>
      </Popover>,
    );

    expect(
      screen
        .getByRole("button", { name: "Filters" })
        .hasAttribute("aria-describedby"),
    ).toBe(false);
    expect(screen.getByRole("button", { name: "Apply filters" })).toBeTruthy();
  });
});
