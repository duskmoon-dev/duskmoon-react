import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

describe("Steps", () => {
  test("renders items with DuskMoon stepper classes and automatic status", () => {
    const { container } = render(
      <Steps
        current={1}
        items={[
          { title: "Account", description: "Create user" },
          { title: "Profile", description: "Add details" },
          { title: "Done", description: "Review" },
        ]}
      />,
    );

    expect(container.querySelector(".stepper")).toBeTruthy();
    expect(container.querySelectorAll(".stepper-step").length).toBe(3);
    expect(container.querySelector(".stepper-step-completed")).toBeTruthy();
    expect(container.querySelector(".stepper-step-active")).toBeTruthy();
    expect(container.querySelector(".stepper-step-wait")).toBeTruthy();
    expect(screen.getByText("Account")).toBeTruthy();
    expect(screen.getByText("Add details")).toBeTruthy();
  });

  test("supports direction, status, className, and percent progress", () => {
    const { container } = render(
      <Steps
        className="custom-steps"
        direction="vertical"
        current={1}
        percent={42}
        items={[{ title: "First" }, { title: "Second" }]}
      />,
    );

    expect(container.querySelector(".custom-steps")).toBeTruthy();
    expect(container.querySelector(".stepper-vertical")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "42",
    );

    render(
      <Steps
        current={1}
        status="error"
        items={[{ title: "One" }, { title: "Two" }]}
      />,
    );

    expect(document.querySelector(".stepper-step-error")).toBeTruthy();
  });

  test("calls onChange for clickable steps and ignores disabled items", () => {
    let nextCurrent = -1;

    render(
      <Steps
        current={0}
        onChange={(value) => {
          nextCurrent = value;
        }}
        items={[
          { title: "First" },
          { title: "Second" },
          { title: "Third", disabled: true },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Second/ }));
    expect(nextCurrent).toBe(1);

    fireEvent.click(screen.getByRole("button", { name: /Third/ }));
    expect(nextCurrent).toBe(1);
  });

  test("supports progressDot boolean and custom renderer", () => {
    const { container } = render(
      <Steps
        current={0}
        progressDot
        items={[{ title: "Queued" }, { title: "Running" }]}
      />,
    );

    expect(container.querySelector(".stepper-progress-dot")).toBeTruthy();
    expect(container.querySelector(".stepper-step-dot-inner")).toBeTruthy();

    render(
      <Steps
        current={1}
        progressDot={(dot, info) => (
          <span data-testid={`dot-${info.index}`}>
            {info.status}
            {dot}
          </span>
        )}
        items={[{ title: "Queued" }, { title: "Running" }]}
      />,
    );

    expect(screen.getByTestId("dot-1").textContent).toContain("process");
  });

  test("supports Steps.Step children compatibility and root ref", () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <Steps ref={ref} current={1}>
        <Steps.Step title="Legacy one" description="Done" />
        <Steps.Step title="Legacy two" content="Working" />
      </Steps>,
    );

    expect(ref.current?.className).toContain("stepper");
    expect(screen.getByText("Legacy one")).toBeTruthy();
    expect(screen.getByText("Working")).toBeTruthy();
  });
});
