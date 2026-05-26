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
    expect(tooltip.className).toContain("tooltip-show");
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

    expect(tooltip.className).not.toContain("tooltip-show");

    fireEvent.mouseEnter(wrapper);
    expect(tooltip.className).toContain("tooltip-show");

    fireEvent.mouseLeave(wrapper);
    expect(tooltip.className).not.toContain("tooltip-show");
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
