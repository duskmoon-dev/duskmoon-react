import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Watermark } from "./Watermark";

describe("Watermark", () => {
  test("renders content and generated watermark layer", () => {
    const { container } = render(
      <Watermark content="DuskMoon" gap={[20, 30]} offset={[4, 6]}>
        <main>Report</main>
      </Watermark>,
    );

    const root = container.querySelector(".watermark") as HTMLDivElement;
    const layer = root.querySelector("[aria-hidden='true']") as HTMLDivElement;

    expect(screen.getByText("Report")).toBeTruthy();
    expect(layer.getAttribute("data-watermark-source")).toBe("DuskMoon");
    expect(layer.style.backgroundSize).toBe("200px 150px");
    expect(layer.style.backgroundPosition).toBe("4px 6px");
  });
});
