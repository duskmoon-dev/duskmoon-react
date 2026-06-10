import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Space } from "./Space";

describe("Space", () => {
  test("renders children with spacing wrappers", () => {
    const { container } = render(
      <Space>
        <span>One</span>
        <span>Two</span>
      </Space>,
    );

    expect(screen.getByText("One")).toBeTruthy();
    expect(screen.getByText("Two")).toBeTruthy();
    expect(container.querySelector(".space")).toBeTruthy();
    expect(container.querySelectorAll(".space-item").length).toBe(2);
  });

  test("supports size and vertical direction", () => {
    const { container } = render(
      <Space size="large" direction="vertical">
        <span>Vertical</span>
      </Space>,
    );
    const space = container.firstChild as HTMLElement;

    expect(space.className).toContain("space-vertical");
    expect(space.style.gap).toBe("24px");
    expect(space.style.flexDirection).toBe("column");
  });

  test("supports split and wrap", () => {
    const { container } = render(
      <Space split="|" wrap>
        <span>One</span>
        <span>Two</span>
      </Space>,
    );

    expect(container.querySelector(".space-wrap")).toBeTruthy();
    expect(container.querySelector(".space-split")?.textContent).toBe("|");
  });

  test("exposes Compact component", () => {
    const { container } = render(
      <Space.Compact block>
        <button>Save</button>
      </Space.Compact>,
    );
    const compact = container.firstChild as HTMLElement;

    expect(compact.className).toContain("space-compact");
    expect(compact.className).toContain("space-compact-block");
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Space ref={ref} />);

    expect(ref.current?.className).toContain("space");
  });
});
