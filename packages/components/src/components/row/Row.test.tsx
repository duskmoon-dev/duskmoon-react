import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Row } from "./Row";

describe("Row", () => {
  test("renders flex row with gutter, align, justify, and wrap classes", () => {
    const { container } = render(
      <Row
        gutter={[12, 8]}
        align="middle"
        justify="space-between"
        wrap={false}
        className="custom-row"
      >
        <span>child</span>
      </Row>,
    );

    const row = container.querySelector(".row") as HTMLDivElement;

    expect(row.className).toContain("custom-row");
    expect(row.className).toContain("row-align-middle");
    expect(row.className).toContain("row-justify-space-between");
    expect(row.className).toContain("row-nowrap");
    expect(row.style.columnGap).toBe("12px");
    expect(row.style.rowGap).toBe("8px");
    expect(screen.getByText("child")).toBeTruthy();
  });
});
