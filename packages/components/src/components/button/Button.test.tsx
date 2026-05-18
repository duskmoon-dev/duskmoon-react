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
    const button = screen.getByRole('button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });
});
