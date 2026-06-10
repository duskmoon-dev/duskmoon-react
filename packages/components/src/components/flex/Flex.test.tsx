import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Flex } from "./Flex";

describe("Flex", () => {
  test("renders children with default class", () => {
    render(
      <Flex>
        <span>Child</span>
      </Flex>,
    );
    const flex = screen.getByText("Child").parentElement as HTMLElement;

    expect(screen.getByText("Child")).toBeTruthy();
    expect(flex.className).toContain("flex");
    expect(flex.style.display).toBe("flex");
  });

  test("supports gap, justify, and align", () => {
    const { container } = render(
      <Flex gap={16} justify="center" align="center">
        <span>One</span>
      </Flex>,
    );
    const flex = container.firstChild as HTMLElement;

    expect(flex.style.gap).toBe("16px");
    expect(flex.style.justifyContent).toBe("center");
    expect(flex.style.alignItems).toBe("center");
  });

  test("supports vertical and wrap", () => {
    const { container } = render(
      <Flex vertical wrap>
        <span>One</span>
      </Flex>,
    );
    const flex = container.firstChild as HTMLElement;

    expect(flex.className).toContain("flex-vertical");
    expect(flex.className).toContain("flex-wrap");
    expect(flex.style.flexDirection).toBe("column");
    expect(flex.style.flexWrap).toBe("wrap");
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Flex ref={ref} />);

    expect(ref.current?.className).toContain("flex");
  });
});
