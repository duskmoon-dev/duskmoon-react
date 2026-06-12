import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";
import React from "react";

describe("Badge", () => {
  test("renders children correctly", () => {
    render(<Badge>Badge text</Badge>);
    expect(screen.getByText("Badge text")).toBeTruthy();
  });

  test("applies default classes", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("badge");
    expect(badge.className).toContain("badge-primary");
    expect(badge.className).toContain("badge-md");
  });

  test("applies color, appearance, and size classes", () => {
    const { container } = render(
      <Badge color="success" appearance="outline" size="lg">
        Custom
      </Badge>,
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("badge-success");
    expect(badge.className).toContain("badge-outline");
    expect(badge.className).toContain("badge-lg");
  });

  test("applies custom className", () => {
    const { container } = render(
      <Badge className="my-custom-badge">Custom class</Badge>,
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain("my-custom-badge");
  });
});
