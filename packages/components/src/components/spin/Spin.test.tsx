import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Spin } from "./Spin";

describe("Spin", () => {
  test("renders a spinning indicator by default", () => {
    render(<Spin />);
    const spin = screen.getByRole("status");

    expect(spin.className).toContain("spin");
    expect(spin.className).toContain("spin-spinning");
    expect(spin.className).toContain("progress-circular");
    expect(spin.getAttribute("aria-busy")).toBe("true");
  });

  test("supports spinning false", () => {
    render(<Spin spinning={false} />);
    const spin = screen.getByRole("status");

    expect(spin.className).not.toContain("spin-spinning");
    expect(spin.getAttribute("aria-busy")).toBe("false");
  });

  test("renders tip and nested children", () => {
    render(
      <Spin tip="Loading">
        <div>Content</div>
      </Spin>,
    );

    expect(screen.getByText("Loading")).toBeTruthy();
    expect(screen.getByText("Content")).toBeTruthy();
    expect(document.querySelector(".spin-nested-loading")).toBeTruthy();
    expect(document.querySelector(".spin-blur")).toBeTruthy();
  });

  test("applies size and custom className", () => {
    render(<Spin size="large" className="custom-spin" />);
    const spin = screen.getByRole("status");

    expect(spin.className).toContain("spin-lg");
    expect(spin.className).toContain("custom-spin");
  });

  test("supports default indicator static method", () => {
    Spin.setDefaultIndicator(<span data-testid="default-indicator" />);
    render(<Spin />);

    expect(screen.getByTestId("default-indicator")).toBeTruthy();
    expect(typeof Spin.setDefaultIndicator).toBe("function");

    Spin.setDefaultIndicator(undefined);
  });

  test("forwards indicator ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spin ref={ref} />);

    expect(ref.current?.className).toContain("spin");
  });
});
