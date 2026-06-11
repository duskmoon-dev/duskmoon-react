import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { Popover } from "./Popover";

describe("Popover", () => {
  test("renders title/content when hover opens and closes", () => {
    render(
      <Popover title="Info" content="Hello" trigger="hover">
        <button type="button">Target</button>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Target" });

    expect(screen.getByRole("tooltip").className).not.toContain("popover-show");

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("tooltip").className).toContain("popover-show");

    fireEvent.mouseLeave(trigger);
    expect(screen.getByRole("tooltip").className).not.toContain("popover-show");
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
    expect(screen.getByRole("tooltip")).toBeTruthy();

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
  });
});
