import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmSplitter } from "./DmSplitter";

describe("DmSplitter", () => {
  test("renders panels through the local Splitter primitive", () => {
    const { container } = render(
      <DmSplitter defaultSizes={[120, "1fr"]} gap={8}>
        <DmSplitter.Panel>Left</DmSplitter.Panel>
        <DmSplitter.Panel>Right</DmSplitter.Panel>
      </DmSplitter>,
    );

    expect(container.querySelector(".dm-splitter")).toBeTruthy();
    expect(container.querySelector(".splitter")).toBeTruthy();
    expect(
      (container.querySelector(".splitter-panel") as HTMLElement).style.width,
    ).toBe("120px");
    expect(screen.getByText("Left")).toBeTruthy();
  });

  test("persists resized sizes to localStorage and restores them", () => {
    window.localStorage.clear();

    const first = render(
      <DmSplitter
        defaultSizes={[120, 120]}
        persistence={{ persistenceKey: "dm-splitter-test" }}
      >
        <DmSplitter.Panel>First</DmSplitter.Panel>
        <DmSplitter.Panel>Second</DmSplitter.Panel>
      </DmSplitter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Resize previous panel larger" }),
    );
    first.unmount();

    const { container } = render(
      <DmSplitter
        defaultSizes={[120, 120]}
        persistence={{ persistenceKey: "dm-splitter-test" }}
      >
        <DmSplitter.Panel>First</DmSplitter.Panel>
        <DmSplitter.Panel>Second</DmSplitter.Panel>
      </DmSplitter>,
    );

    expect(
      (container.querySelector(".splitter-panel") as HTMLElement).style.width,
    ).toBe("136px");
  });

  test("supports reset and panel collapse basics", () => {
    const resizes: Array<Array<number | string>> = [];
    const { container } = render(
      <DmSplitter
        defaultSizes={[120, 120]}
        resettable
        onResize={(sizes) => resizes.push(sizes)}
      >
        <DmSplitter.Panel collapsible>First</DmSplitter.Panel>
        <DmSplitter.Panel>Second</DmSplitter.Panel>
      </DmSplitter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Resize previous panel larger" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
    expect(container.querySelector(".splitter-panel-collapsed")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(resizes.at(-1)).toEqual([120, 120]);
  });
});
