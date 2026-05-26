import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Result } from "./Result";

describe("Result", () => {
  test("renders info result by default", () => {
    const { container } = render(<Result title="Ready" />);
    const result = container.firstChild as HTMLElement;

    expect(result.className).toContain("result");
    expect(result.className).toContain("result-info");
    expect(screen.getByRole("status")).toBe(result);
    expect(screen.getByRole("img", { name: "Info" })).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
  });

  test("renders supported semantic statuses", () => {
    const statuses = [
      "success",
      "error",
      "info",
      "warning",
      "404",
      "403",
      "500",
    ] as const;

    for (const status of statuses) {
      const { container, unmount } = render(<Result status={status} />);
      const result = container.firstChild as HTMLElement;

      expect(result.className).toContain(`result-${status}`);
      expect(
        result.querySelector(`.result-presented-icon-${status}`),
      ).toBeTruthy();

      unmount();
    }
  });

  test("normalizes numeric exception statuses", () => {
    const { container } = render(<Result status={404} />);
    const result = container.firstChild as HTMLElement;

    expect(result.className).toContain("result-404");
    expect(result.querySelector(".result-presented-icon-404")).toBeTruthy();
  });

  test("renders title subtitle extra and custom icon", () => {
    render(
      <Result
        status="success"
        title="Created"
        subTitle="The record is available."
        icon={<span data-testid="custom-icon" />}
        extra={<button>Open</button>}
      />,
    );

    expect(screen.getByText("Created")).toBeTruthy();
    expect(screen.getByText("The record is available.")).toBeTruthy();
    expect(screen.getByTestId("custom-icon")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Success" })).toBeNull();
  });

  test("supports native div props, custom className, and forwarded ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Result
        ref={ref}
        className="custom-result"
        data-testid="result"
        role="presentation"
      />,
    );
    const result = container.firstChild as HTMLDivElement;

    expect(result.className).toContain("custom-result");
    expect(screen.getByTestId("result") as HTMLDivElement).toBe(result);
    expect(screen.getByTestId("result").getAttribute("role")).toBe(
      "presentation",
    );
    expect(ref.current).toBe(result);
  });
});
