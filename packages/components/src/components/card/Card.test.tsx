import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";
import React from "react";

describe("Card", () => {
  test("renders children correctly", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeTruthy();
  });

  test("applies default classes", () => {
    const { container } = render(<Card>Default</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("card");
    expect(card.className).toContain("card-elevated");
    expect(card.className).toContain("card-padding-md");
  });

  test("applies appearance and padding classes", () => {
    const { container } = render(
      <Card appearance="outline" padding="lg">
        Custom
      </Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("card-outline");
    expect(card.className).toContain("card-padding-lg");
  });

  test("applies custom className", () => {
    const { container } = render(
      <Card className="my-custom-class">Custom class</Card>,
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("my-custom-class");
  });
});
