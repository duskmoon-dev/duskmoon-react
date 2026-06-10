import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  test("renders title and children when open", () => {
    render(
      <Drawer open title="Test drawer">
        Drawer content
      </Drawer>,
    );

    expect(screen.getByText("Test drawer")).toBeTruthy();
    expect(screen.getByText("Drawer content")).toBeTruthy();
    expect(screen.getByRole("dialog").className).toContain("drawer-open");
  });

  test("keeps closed drawer without open class", () => {
    render(
      <Drawer open={false} title="Hidden drawer">
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole("dialog", { hidden: true });
    expect(drawer.className).toContain("drawer");
    expect(drawer.className).not.toContain("drawer-open");
    expect(drawer.getAttribute("aria-hidden")).toBe("true");
  });

  test("supports title prop", () => {
    render(
      <Drawer open title="Drawer title">
        Content
      </Drawer>,
    );

    expect(screen.getByText("Drawer title")).toBeTruthy();
  });

  test("supports placement classes", () => {
    render(
      <Drawer open placement="left" title="Left drawer">
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole("dialog");
    expect(drawer.className).toContain("drawer-left");
    expect(screen.getByText("Left drawer")).toBeTruthy();
    expect(screen.getByText("Content")).toBeTruthy();
  });

  test("calls onClose from the close button", () => {
    let closeCount = 0;
    render(
      <Drawer open title="Closable" onClose={() => closeCount++}>
        Content
      </Drawer>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(closeCount).toBe(1);
  });

  test("renders footer and extra content", () => {
    render(
      <Drawer
        open
        title="With slots"
        extra={<button>Extra action</button>}
        footer="Footer actions"
      >
        Content
      </Drawer>,
    );

    expect(screen.getByText("Extra action")).toBeTruthy();
    expect(screen.getByText("Footer actions")).toBeTruthy();
    expect(document.querySelector(".drawer-footer")).toBeTruthy();
  });

  test("applies size, placement, width, and height", () => {
    render(
      <Drawer open placement="bottom" size="xl" width={320} height="50vh">
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole("dialog");
    expect(drawer.className).toContain("drawer-bottom");
    expect(drawer.className).toContain("drawer-xl");
    expect(drawer.style.width).toBe("320px");
    expect(drawer.style.height).toBe("50vh");
  });

  test("forwards aside ref and native props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Drawer ref={ref} open className="custom-drawer" data-testid="drawer">
        Content
      </Drawer>,
    );

    expect(ref.current).toBe(screen.getByTestId("drawer"));
    expect(ref.current?.className).toContain("custom-drawer");
  });
});
