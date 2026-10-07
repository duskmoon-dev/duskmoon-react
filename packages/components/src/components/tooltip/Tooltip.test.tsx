import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  test("renders child content", () => {
    render(
      <Tooltip title="Help text">
        <span>Hover me</span>
      </Tooltip>,
    );

    expect(screen.getByText("Hover me")).toBeTruthy();
  });

  test("renders title in tooltip element", () => {
    render(
      <Tooltip title="Tool tip" defaultOpen>
        <button>Button</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip");

    expect(screen.getByText("Button")).toBeTruthy();
    expect(tooltip.textContent).toContain("Tool tip");
    expect(tooltip.matches(":popover-open")).toBe(true);
    expect(tooltip.getAttribute("popover")).toBe("hint");
    expect(screen.getByRole("button").getAttribute("aria-describedby")).toBe(
      tooltip.id,
    );
  });

  test("supports placement, size, arrow, and custom className", () => {
    render(
      <Tooltip
        title="Tip"
        placement="bottom"
        size="lg"
        arrow={false}
        className="custom-tooltip"
        defaultOpen
      >
        <span>Trigger</span>
      </Tooltip>,
    );
    const tooltip = screen.getByRole("tooltip");

    expect(tooltip.className).toContain("tooltip-bottom");
    expect(tooltip.className).toContain("tooltip-lg");
    expect(tooltip.className).toContain("tooltip-no-arrow");
    expect(tooltip.className).toContain("custom-tooltip");
  });

  test("opens and closes on hover when uncontrolled", () => {
    const { container } = render(
      <Tooltip title="Tip">
        <span>Trigger</span>
      </Tooltip>,
    );
    const wrapper = container.querySelector(".tooltip-wrapper") as HTMLElement;
    const tooltip = screen.getByRole("tooltip");

    expect(tooltip.matches(":popover-open")).toBe(false);

    fireEvent.mouseEnter(wrapper);
    expect(tooltip.matches(":popover-open")).toBe(true);

    fireEvent.mouseLeave(wrapper);
    expect(tooltip.matches(":popover-open")).toBe(false);
  });

  test("reports native dismissal and can reopen on the next hover", () => {
    const changes: boolean[] = [];
    const { container } = render(
      <Tooltip title="Tip" onOpenChange={(open) => changes.push(open)}>
        <button type="button">Trigger</button>
      </Tooltip>,
    );
    const wrapper = container.querySelector(".tooltip-wrapper") as HTMLElement;
    const tooltip = screen.getByRole("tooltip");

    fireEvent.mouseEnter(wrapper);
    tooltip.hidePopover();
    fireEvent(
      tooltip,
      Object.assign(new Event("toggle"), {
        oldState: "open",
        newState: "closed",
      }),
    );
    expect(tooltip.matches(":popover-open")).toBe(false);
    expect(changes).toEqual([true, false]);

    fireEvent.mouseEnter(wrapper);
    expect(tooltip.matches(":popover-open")).toBe(true);
    expect(changes).toEqual([true, false, true]);
  });

  test("forwards wrapper ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tooltip ref={ref} title="Tip">
        <span>Trigger</span>
      </Tooltip>,
    );

    expect(ref.current?.className).toContain("tooltip-wrapper");
  });
});
