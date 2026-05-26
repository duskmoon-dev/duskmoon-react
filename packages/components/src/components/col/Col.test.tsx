import React from "react";
import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { Col } from "./Col";

describe("Col", () => {
  test("renders span, offset, order, push, pull, flex, and responsive metadata", () => {
    const { container } = render(
      <Col
        span={12}
        offset={2}
        order={3}
        push={1}
        pull={1}
        xs={24}
        md={{ span: 8 }}
        className="custom-col"
      />,
    );

    const col = container.querySelector(".col") as HTMLDivElement;

    expect(col.className).toContain("custom-col");
    expect(col.style.flex).toBe("0 0 50%");
    expect(col.style.maxWidth).toBe("50%");
    expect(col.style.marginInlineStart).toBe("8.333333333333332%");
    expect(col.style.order).toBe("3");
    expect(col.getAttribute("data-xs-span")).toBe("24");
    expect(col.getAttribute("data-md-span")).toBe("8");
  });
});
