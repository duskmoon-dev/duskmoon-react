import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider";
import React from "react";

describe("Divider", () => {
  test("renders a separator with default classes", () => {
    render(<Divider />);
    const divider = screen.getByRole("separator");

    expect(divider.className).toContain("divider");
    expect(divider.className).toContain("divider-solid");
    expect(divider.className).toContain("divider-thin");
    expect(divider.getAttribute("aria-orientation")).toBe("horizontal");
  });

  test("applies vertical, variant, color, thickness, and spacing classes", () => {
    render(
      <Divider
        orientation="vertical"
        variant="dashed"
        color="primary"
        thickness="thick"
        spacing="compact"
      />,
    );
    const divider = screen.getByRole("separator");

    expect(divider.className).toContain("divider-vertical");
    expect(divider.className).toContain("divider-dashed");
    expect(divider.className).toContain("divider-primary");
    expect(divider.className).toContain("divider-thick");
    expect(divider.className).toContain("divider-compact");
    expect(divider.getAttribute("aria-orientation")).toBe("vertical");
  });

  test("renders label content with label position classes", () => {
    render(<Divider labelPosition="left">Section</Divider>);
    const divider = screen.getByRole("separator");

    expect(screen.getByText("Section")).toBeTruthy();
    expect(divider.className).toContain("divider-text-left");
  });

  test("applies custom className", () => {
    render(<Divider className="custom-divider" />);
    const divider = screen.getByRole("separator");

    expect(divider.className).toContain("custom-divider");
  });
});
