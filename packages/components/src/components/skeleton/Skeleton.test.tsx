import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  test("renders title and paragraph placeholders by default", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("skeleton-group");
    expect(skeleton.getAttribute("aria-busy")).toBe("true");
    expect(skeleton.querySelectorAll(".skeleton-text").length).toBe(4);
  });

  test("renders children when loading is false", () => {
    render(
      <Skeleton loading={false}>
        <span>Loaded content</span>
      </Skeleton>,
    );

    expect(screen.getByText("Loaded content")).toBeTruthy();
  });

  test("applies primitive variant classes", () => {
    render(<Skeleton variant="circle" data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("skeleton");
    expect(skeleton.className).toContain("skeleton-circle");
  });

  test("applies compound variant classes", () => {
    render(
      <>
        <Skeleton.Button data-testid="button-skeleton" />
        <Skeleton.Input data-testid="input-skeleton" />
        <Skeleton.Avatar data-testid="avatar-skeleton" />
        <Skeleton.Image data-testid="image-skeleton" />
        <Skeleton.Node data-testid="node-skeleton" />
      </>,
    );

    expect(screen.getByTestId("button-skeleton").className).toContain(
      "skeleton-button",
    );
    expect(screen.getByTestId("input-skeleton").className).toContain(
      "skeleton-input",
    );
    expect(screen.getByTestId("avatar-skeleton").className).toContain(
      "skeleton-circle",
    );
    expect(screen.getByTestId("image-skeleton").className).toContain(
      "skeleton-rect",
    );
    expect(screen.getByTestId("node-skeleton").className).toContain(
      "skeleton-rect",
    );
  });

  test("uses wave animation when active and static behavior by default", () => {
    const { rerender } = render(
      <Skeleton variant="text" active data-testid="skeleton" />,
    );
    let skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("skeleton-wave");
    expect(skeleton.className).not.toContain("skeleton-static");

    rerender(<Skeleton variant="text" data-testid="skeleton" />);
    skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("skeleton-static");
    expect(skeleton.className).not.toContain("skeleton-wave");
  });

  test("supports pulse animation without static or wave modifiers", () => {
    render(
      <Skeleton variant="rect" animation="pulse" data-testid="skeleton" />,
    );
    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("skeleton-rect");
    expect(skeleton.className).not.toContain("skeleton-static");
    expect(skeleton.className).not.toContain("skeleton-wave");
  });

  test("applies custom className", () => {
    render(
      <Skeleton
        variant="rect"
        className="custom-skeleton"
        data-testid="skeleton"
      />,
    );
    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton.className).toContain("custom-skeleton");
  });
});
