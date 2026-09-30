import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Alert } from "./Alert";
import React from "react";

describe("Alert", () => {
  test("renders children correctly", () => {
    render(<Alert>Warning message</Alert>);
    expect(screen.getByText("Warning message")).toBeTruthy();
  });

  test("applies default classes", () => {
    render(<Alert>Default alert</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("alert");
    expect(alert.className).toContain("alert-info");
    expect(alert.className).toContain("alert-filled");
  });

  test("applies color and appearance classes", () => {
    render(
      <Alert color="error" appearance="outline">
        Error alert
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("alert-error");
    expect(alert.className).toContain("alert-outlined");
  });

  test("maps tonal appearance to the base container style", () => {
    render(
      <Alert color="warning" appearance="tonal">
        Tonal alert
      </Alert>,
    );
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("alert-warning");
    expect(alert.className).not.toContain("alert-filled");
    expect(alert.className).not.toContain("alert-outlined");
  });

  test("applies custom className", () => {
    render(<Alert className="custom-class">Custom class</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert.className).toContain("custom-class");
  });
});
