import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmAuxiliary } from "./DmAuxiliary";

describe("DmAuxiliary", () => {
  test("renders html content and closes", () => {
    const { container } = render(<DmAuxiliary content="Hello <strong>World</strong>" />);

    expect(container.querySelector(".dm-auxiliary")).toBeTruthy();
    expect(screen.getByText("World")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close auxiliary" }));

    expect(container.querySelector(".dm-auxiliary")).toBeNull();
  });

  test("supports children, hidden close, actions, extra, and custom icon", () => {
    const actions: string[] = [];

    render(
      <DmAuxiliary
        hideClose
        icon={<span>info</span>}
        actions={[{ label: "Apply", onClick: () => actions.push("apply") }]}
        extra={<span>Extra</span>}
      >
        <span>Child content</span>
      </DmAuxiliary>,
    );

    expect(screen.getByText("info")).toBeTruthy();
    expect(screen.getByText("Child content")).toBeTruthy();
    expect(screen.getByText("Extra")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close auxiliary" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(actions).toEqual(["apply"]);
  });

  test("does not render without content", () => {
    const { container } = render(<DmAuxiliary />);
    expect(container.querySelector(".dm-auxiliary")).toBeNull();
  });
});

