import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { FloatButton } from "./FloatButton";

describe("FloatButton", () => {
  test("renders icon, type, shape, description, tooltip, and badge", () => {
    const { container } = render(
      <FloatButton
        icon={<span data-testid="icon">+</span>}
        type="primary"
        shape="square"
        description="Create"
        tooltip={{ title: "Create item", placement: "left" }}
        badge={{ count: 3 }}
        className="custom-float"
      />,
    );

    const button = screen.getByRole("button") as HTMLButtonElement;

    expect(button.className).toContain("float-button");
    expect(button.className).toContain("btn-primary");
    expect(button.className).toContain("btn-square");
    expect(button.className).toContain("custom-float");
    expect(screen.getByTestId("icon")).toBeTruthy();
    expect(screen.getByText("Create")).toBeTruthy();
    expect(screen.getByText("3").className).toContain("float-button-badge");
    expect(screen.getByRole("tooltip").textContent).toBe("Create item");
    expect(container.querySelector(".tooltip-left")).toBeTruthy();
  });

  test("supports links, disabled links, refs, and overflow badge count", () => {
    const ref = createRef<HTMLAnchorElement>();
    const { rerender } = render(
      <FloatButton
        ref={ref}
        href="/docs"
        target="_blank"
        badge={{ count: 120, overflowCount: 99 }}
      />,
    );

    const link = screen.getByRole("link") as HTMLAnchorElement;

    expect(link.getAttribute("href")).toBe("/docs");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("99+")).toBeTruthy();
    expect(ref.current).toBe(link);

    rerender(<FloatButton href="/docs" disabled />);

    const disabledLink = document.querySelector("a") as HTMLAnchorElement;
    expect(disabledLink.getAttribute("href")).toBeNull();
    expect(disabledLink.getAttribute("aria-disabled")).toBe("true");
  });

  test("renders group with inherited shape and trigger state", () => {
    const { container } = render(
      <FloatButton.Group shape="square" trigger="click" closeIcon="Open">
        <FloatButton icon="A" />
      </FloatButton.Group>,
    );

    const group = container.querySelector(".float-button-group") as HTMLElement;

    expect(group.className).not.toContain("float-button-group-open");
    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByText("Open")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    const button = container.querySelector(".float-button") as HTMLElement;
    expect(group.className).toContain("float-button-group-open");
    expect(button.className).toContain("btn-square");
  });

  test("back top becomes visible and scrolls target", () => {
    let scrollTop = 500;
    let scrolledTo = -1;
    const target = document.createElement("div");

    Object.defineProperty(target, "scrollTop", {
      get: () => scrollTop,
      set: (value) => {
        scrollTop = value;
      },
    });
    target.scrollTo = ((options?: ScrollToOptions | number) => {
      const top = typeof options === "number" ? options : options?.top;
      scrolledTo = Number(top);
      scrollTop = Number(top);
    }) as HTMLElement["scrollTo"];

    render(
      <FloatButton.BackTop
        visibilityHeight={100}
        target={() => target}
        tooltip="Back"
      />,
    );

    const button = screen.getByRole("button", { name: "Back to top" });

    expect(button.hidden).toBe(false);
    expect(button.className).toContain("float-button-back-top-visible");
    expect(screen.getByRole("tooltip").textContent).toBe("Back");

    fireEvent.click(button);

    expect(scrolledTo).toBe(0);
  });
});
