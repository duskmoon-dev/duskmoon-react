import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Splitter } from "./Splitter";

describe("Splitter", () => {
  test("renders horizontal panels with default sizes", () => {
    const { container } = render(
      <Splitter defaultSizes={[120, "1fr"]}>
        <Splitter.Panel>Left</Splitter.Panel>
        <Splitter.Panel>Right</Splitter.Panel>
      </Splitter>,
    );

    const root = container.querySelector(".splitter") as HTMLElement;
    const panels = container.querySelectorAll(".splitter-panel");

    expect(root.className).toContain("splitter-horizontal");
    expect(panels[0].textContent).toContain("Left");
    expect((panels[0] as HTMLElement).style.width).toBe("120px");
  });

  test("supports vertical layout and controlled sizes", () => {
    const { container } = render(
      <Splitter layout="vertical" sizes={[80, 160]}>
        <Splitter.Panel>Top</Splitter.Panel>
        <Splitter.Panel>Bottom</Splitter.Panel>
      </Splitter>,
    );

    const root = container.querySelector(".splitter") as HTMLElement;
    const panels = container.querySelectorAll(".splitter-panel");

    expect(root.className).toContain("splitter-vertical");
    expect(root.style.flexDirection).toBe("column");
    expect((panels[0] as HTMLElement).style.height).toBe("80px");
  });

  test("resizes uncontrolled numeric panels", () => {
    const resizes: Array<Array<number | string>> = [];
    const { container } = render(
      <Splitter defaultSizes={[120, 120]} onResize={(sizes) => resizes.push(sizes)}>
        <Splitter.Panel min={100} max={150}>
          First
        </Splitter.Panel>
        <Splitter.Panel>Second</Splitter.Panel>
      </Splitter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Resize previous panel larger" }),
    );

    const panels = container.querySelectorAll(".splitter-panel");
    expect((panels[0] as HTMLElement).style.width).toBe("136px");
    expect(resizes.at(-1)).toEqual([136, 104]);
  });

  test("collapses and expands collapsible panels", () => {
    const collapses: boolean[] = [];
    const { container } = render(
      <Splitter defaultSizes={[120, 120]}>
        <Splitter.Panel collapsible onCollapse={(collapsed) => collapses.push(collapsed)}>
          First
        </Splitter.Panel>
        <Splitter.Panel>Second</Splitter.Panel>
      </Splitter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));

    const first = container.querySelector(".splitter-panel") as HTMLElement;
    expect(first.className).toContain("splitter-panel-collapsed");
    expect(first.style.width).toBe("0px");
    expect(collapses).toEqual([true]);

    fireEvent.click(screen.getByRole("button", { name: "Expand panel" }));
    expect(collapses).toEqual([true, false]);
  });

  test("disables handle when adjacent panel is not resizable", () => {
    render(
      <Splitter defaultSizes={[120, 120]}>
        <Splitter.Panel resizable={false}>First</Splitter.Panel>
        <Splitter.Panel>Second</Splitter.Panel>
      </Splitter>,
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Resize previous panel larger",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
