import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmLayout, deriveDmLayoutSelection } from "./DmLayout";
import type { DmMenuSchema } from "../dm-menu/DmMenu.types";

const menus: DmMenuSchema[] = [
  {
    menuId: 1,
    parentId: 0,
    productId: 1,
    menuName: "Cloud",
    menuNameEn: "Cloud",
    menuUrl: "/cloud",
    children: [
      {
        menuId: 2,
        parentId: 1,
        productId: 1,
        menuName: "Instances",
        menuUrl: "/cloud/instances",
        tipsEnabled: true,
        tips: "Instance help",
        children: [
          {
            menuId: 3,
            parentId: 2,
            productId: 1,
            menuName: "Detail",
            menuUrl: "/cloud/instances/detail",
            subRouter: true,
            tipsEnabled: true,
            tips: "Detail help",
          },
        ],
      },
    ],
  },
];

describe("DmLayout", () => {
  test("derives selected menu, open keys, breadcrumb, and tips", () => {
    const selection = deriveDmLayoutSelection({
      menus,
      selectedKey: "/cloud/instances/detail/42",
      openAllKeys: false,
    });

    expect(selection.selectedMenuKey).toBe("/cloud/instances");
    expect(selection.selectedBreadcrumbKey).toBe("/cloud/instances/detail");
    expect(selection.openKeys).toEqual(["/cloud"]);
    expect(selection.breadcrumbItems.map((item) => item.title)).toEqual([
      "Cloud",
      "Instances",
      "Detail",
    ]);
    expect(selection.tips).toBe("Detail help");
  });

  test("renders composed menu, breadcrumb, tips, and content", () => {
    const { container } = render(
      <DmLayout menus={menus} selectedKey="/cloud/instances/detail/42">
        <main>Page content</main>
      </DmLayout>,
    );

    expect(container.querySelector(".dm-layout")).toBeTruthy();
    expect(container.querySelector(".dm-layout-sider")).toBeTruthy();
    expect(screen.getAllByText("Cloud").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Instances").length).toBeGreaterThan(1);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getByText("Detail")).toBeTruthy();
    expect(screen.getByText("Detail help")).toBeTruthy();
    expect(screen.getByText("Page content")).toBeTruthy();
  });

  test("supports menu clicks, collapse, and explicit breadcrumb items", () => {
    let collapsed: boolean | undefined;
    let clickedKey = "";

    render(
      <DmLayout
        menus={menus}
        selectedKey="/cloud/instances"
        breadcrumbItems={[{ title: "Custom" }]}
        onCollapse={(nextCollapsed) => {
          collapsed = nextCollapsed;
        }}
        onMenuClick={(key) => {
          clickedKey = key;
        }}
      />,
    );

    expect(screen.getByText("Custom")).toBeTruthy();
    fireEvent.click(screen.getByText("Instances"));
    expect(clickedKey).toBe("/cloud/instances");

    fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
    expect(collapsed).toBe(true);
  });
});
