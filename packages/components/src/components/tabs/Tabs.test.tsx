import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Tabs } from "./Tabs";

const items = [
  { key: "overview", label: "Overview", children: <p>Overview content</p> },
  { key: "usage", label: "Usage", children: <p>Usage content</p> },
];

describe("Tabs", () => {
  test("renders items with DuskMoon tab classes", () => {
    const { container } = render(<Tabs items={items} />);

    expect(container.querySelector(".tabs")).toBeTruthy();
    expect(container.querySelector(".tabs-scrollable")).toBeTruthy();
    expect(container.querySelectorAll(".tab").length).toBe(2);
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "tab-active",
    );
    expect(screen.getByText("Overview content")).toBeTruthy();
  });

  test("supports default active key and onChange", () => {
    let nextKey: string | undefined;
    render(
      <Tabs
        defaultActiveKey="usage"
        items={items}
        onChange={(key) => {
          nextKey = key;
        }}
      />,
    );

    expect(screen.getByText("Usage content")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));

    expect(nextKey).toBe("overview");
    expect(screen.getByText("Overview content")).toBeTruthy();
  });

  test("supports controlled active key", () => {
    render(<Tabs activeKey="usage" items={items} />);

    expect(screen.getByRole("tab", { name: "Usage" }).className).toContain(
      "tab-active",
    );
    expect(screen.getByText("Usage content")).toBeTruthy();
  });

  test("supports tab position, type, size, and className", () => {
    const { container } = render(
      <Tabs
        className="custom-tabs"
        items={items}
        size="large"
        tabPosition="left"
        type="card"
      />,
    );

    expect(container.querySelector(".custom-tabs")).toBeTruthy();
    expect(container.querySelector(".tabs-vertical")).toBeTruthy();
    expect(container.querySelector(".tabs-boxed")).toBeTruthy();
    expect(container.querySelector(".tabs-lg")).toBeTruthy();
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });

  test("supports editable add and close callbacks", () => {
    const edits: string[] = [];
    render(
      <Tabs
        type="editable-card"
        items={items}
        onEdit={(targetKey, action) => {
          edits.push(`${action}:${String(targetKey)}`);
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Add tab"));
    fireEvent.click(screen.getByLabelText("Close tab overview"));

    expect(edits[0]?.startsWith("add:")).toBe(true);
    expect(edits[1]).toBe("remove:overview");
  });

  test("supports TabPane compatibility", () => {
    render(
      <Tabs defaultActiveKey="second">
        <Tabs.TabPane key="first" tab="First">
          First content
        </Tabs.TabPane>
        <Tabs.TabPane key="second" tab="Second">
          Second content
        </Tabs.TabPane>
      </Tabs>,
    );

    expect(screen.getByRole("tab", { name: "First" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Second" }).className).toContain(
      "tab-active",
    );
    expect(screen.getByText("Second content")).toBeTruthy();
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tabs ref={ref} items={items} />);

    expect(ref.current?.className).toContain("tabs-root");
  });
});
