import React from "react";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Popover } from "./Popover";

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

    const surface = screen.getByRole("tooltip");
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

    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip").hasAttribute("data-native-open")).toBe(
      true,
    );

    fireEvent.click(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  test("supports controlled open state", () => {
    render(
      <Popover title="Controlled" content="Yes" open={true}>
        <button type="button">Target</button>
      </Popover>,
    );

    expect(screen.getByText("Controlled")).toBeTruthy();
    expect(screen.getByRole("tooltip").hasAttribute("data-native-open")).toBe(
      true,
    );
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

    const surface = screen.getByRole("tooltip");
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
});
