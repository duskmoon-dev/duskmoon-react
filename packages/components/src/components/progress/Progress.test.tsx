import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Progress } from "./Progress";
import React from "react";

describe("Progress", () => {
  test("renders determinate progress with default classes", () => {
    render(<Progress percent={35} />);
    const progress = screen.getByRole("progressbar");
    const bar = progress.querySelector(".progress-bar") as HTMLElement;

    expect(progress.className).toContain("progress");
    expect(progress.className).toContain("progress-md");
    expect(progress.getAttribute("aria-valuenow")).toBe("35");
    expect(bar.style.width).toBe("35%");
  });

  test("clamps percentage values", () => {
    render(<Progress percent={140} />);
    const progress = screen.getByRole("progressbar");
    const bar = progress.querySelector(".progress-bar") as HTMLElement;

    expect(progress.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.style.width).toBe("100%");
  });

  test("applies color, size, and indeterminate classes", () => {
    render(<Progress color="success" size="lg" indeterminate />);
    const progress = screen.getByRole("progressbar");

    expect(progress.className).toContain("progress-success");
    expect(progress.className).toContain("progress-lg");
    expect(progress.className).toContain("progress-indeterminate");
    expect(progress.hasAttribute("aria-valuenow")).toBe(false);
  });

  test("renders formatted progress info", () => {
    render(
      <Progress
        percent={42}
        showInfo
        format={(percent) => `${percent} of 100`}
      />,
    );

    expect(screen.getByText("42 of 100")).toBeTruthy();
    expect(screen.getByRole("progressbar").className).toContain(
      "progress-labeled",
    );
  });

  test("applies custom className", () => {
    render(<Progress className="custom-progress" />);

    expect(screen.getByRole("progressbar").className).toContain(
      "custom-progress",
    );
  });
});
