import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { DmLayoutPreview } from "./DmLayoutPreviews";
import { getComponentDoc } from "../lib/component-docs";
import {
  dmLayoutDemoExamples,
  dmLayoutExamples,
} from "../lib/dm-layout-demo-examples";

describe("authored DmLayout docs examples", () => {
  test("metadata publishes three distinct runnable authored demos with populated menu schemas", () => {
    const docs = getComponentDoc("dm-layout")!;
    expect(docs.demos).toEqual(dmLayoutDemoExamples);
    expect(docs.demos).toHaveLength(3);
    expect(new Set(docs.demos.map((demo) => demo.code)).size).toBe(3);
    for (const [index, demo] of docs.demos.entries()) {
      expect(demo.source).toBe("authored");
      expect(demo.code).toContain('from "@duskmoon-dev/components/dm-layout"');
      expect(demo.code).toContain("menus={menus}");
      expect(demo.code).toContain("onMenuClick={setSelectedKey}");
      expect(demo.code).not.toContain("DuskMoon Dm Layout");
      expect(dmLayoutExamples[index].menus.length).toBeGreaterThan(0);
      expect(
        dmLayoutExamples[index].pages[dmLayoutExamples[index].initialKey],
      ).toBeTruthy();
    }
    expect(
      getComponentDoc("layout")!.demos.some((demo) =>
        demo.code.includes("<Layout"),
      ),
    ).toBe(true);
  });

  test("workspace navigation updates selection, content, and derived breadcrumb", () => {
    const { container } = render(
      <DmLayoutPreview demoTitle="Workspace navigation" />,
    );
    expect(
      screen.getByRole("heading", { name: "Workspace overview" }),
    ).toBeTruthy();
    const menus = within(
      container.querySelector(".dm-menu-content") as HTMLElement,
    );
    fireEvent.click(menus.getByText("Reports", { exact: true }));
    expect(screen.getByRole("heading", { name: "Reports" })).toBeTruthy();
    expect(menus.getByText("Reports").closest("li")?.className).toContain(
      "menu-item-active",
    );
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }).textContent,
    ).toContain("Reports");
    expect(screen.getByText("Current page: /workspace/reports")).toBeTruthy();
  });

  test("nested navigation derives tips and breadcrumbs and lets the parent breadcrumb navigate", () => {
    const { container } = render(
      <DmLayoutPreview demoTitle="Nested navigation and tips" />,
    );
    const menus = within(
      container.querySelector(".dm-menu-content") as HTMLElement,
    );
    expect(
      screen.getByText("Active projects are ready for the next team review."),
    ).toBeTruthy();
    fireEvent.click(
      menus.getByText("Project archive and completed work", { exact: true }),
    );
    expect(
      screen.getByRole("heading", { name: "Project archive" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Archived projects stay available for reference."),
    ).toBeTruthy();
    const breadcrumb = within(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    );
    expect(
      breadcrumb.getByText("Project archive and completed work"),
    ).toBeTruthy();
    fireEvent.click(breadcrumb.getByText("Projects", { exact: true }));
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy();
    expect(
      screen.queryByText("Archived projects stay available for reference."),
    ).toBeNull();
  });

  test("external and internal collapse controls share controlled state without losing selection", () => {
    const { container } = render(
      <DmLayoutPreview demoTitle="Controlled sidebar collapse" />,
    );
    const sider = container.querySelector(".dm-layout-sider") as HTMLElement;
    expect(sider.style.width).toBe("230px");
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(sider.style.width).toBe("60px");
    expect(screen.getByRole("status").textContent).toBe("Sidebar collapsed");
    expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Expand menu" }));
    expect(sider.style.width).toBe("230px");
    expect(screen.getByRole("status").textContent).toBe("Sidebar expanded");
    expect(screen.getByText("Current page: /workspace/projects")).toBeTruthy();
    const menus = within(
      container.querySelector(".dm-menu-content") as HTMLElement,
    );
    expect(menus.getByText("Projects").closest("li")?.className).toContain(
      "menu-item-active",
    );
  });

  test("unknown examples do not fall back to an empty layout", () => {
    const { container } = render(
      <DmLayoutPreview demoTitle="Unknown scenario" />,
    );
    expect(container.querySelector(".dm-layout")).toBeNull();
  });
});
