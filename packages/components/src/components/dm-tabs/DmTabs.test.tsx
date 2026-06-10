import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmTabs } from "./DmTabs";

const items = [
  {
    key: "overview",
    label: "Overview",
    path: "/overview",
    children: <p>Overview content</p>,
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    children: <p>Settings content</p>,
  },
];

describe("DmTabs", () => {
  test("renders line workflow tabs with Dm shell and class names", () => {
    const { container } = render(<DmTabs items={items} />);

    expect(container.querySelector(".dm-tabs-shell")).toBeTruthy();
    expect(container.querySelector(".dm-line-horizontal-tabs")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Overview" }).className).toContain(
      "tab-active",
    );
    expect(screen.getByText("Overview content")).toBeTruthy();
  });

  test("uses vertical line class for side tab positions", () => {
    const { container } = render(<DmTabs items={items} tabPosition="left" />);

    expect(container.querySelector(".dm-line-vertical-tabs")).toBeTruthy();
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });

  test("supports transparent card and option tree workflow variants", () => {
    const { container } = render(
      <DmTabs
        items={items}
        type="card"
        transparentCard
        optionTree
        className="custom-dm-tabs"
      />,
    );

    const root = container.querySelector(".tabs-root");

    expect(root?.className).toContain("dm-card-transparent-tabs");
    expect(root?.className).toContain("dm-option-tree-tabs");
    expect(root?.className).toContain("custom-dm-tabs");
  });

  test("maps destroyOnHidden to primitive inactive pane destruction", () => {
    const { rerender } = render(<DmTabs defaultActiveKey="overview" items={items} />);

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(screen.queryByText("Overview content")).toBeNull();
    expect(screen.getByText("Settings content")).toBeTruthy();

    rerender(
      <DmTabs
        defaultActiveKey="overview"
        destroyOnHidden={false}
        items={items}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(screen.getByText("Overview content")).toBeTruthy();
    expect(screen.getByText("Settings content")).toBeTruthy();
  });

  test("keeps primitive onChange behavior and forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    let activeKey = "";

    render(
      <DmTabs
        ref={ref}
        items={items}
        onChange={(key) => {
          activeKey = key;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Settings" }));

    expect(activeKey).toBe("settings");
    expect(ref.current?.className).toContain("tabs-root");
  });
});
