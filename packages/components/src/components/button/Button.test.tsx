import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import React from "react";

describe("Button", () => {
  test("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeTruthy();
  });

  test("is disabled when loading", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  test("applies color and appearance classes", () => {
    render(
      <Button color="secondary" appearance="outline">
        Color
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("btn-secondary");
    expect(button.className).toContain("btn-outline");
  });

  test("applies shape and size classes", () => {
    render(
      <Button shape="circle" size="lg">
        Size
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("btn-circle");
    expect(button.className).toContain("btn-lg");
  });

  test("applies block class", () => {
    render(<Button block>Block</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("btn-block");
  });
});
