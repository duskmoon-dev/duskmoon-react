import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmMenu, createDmMenuItems } from "./DmMenu";
import type { DmMenuSchema } from "./DmMenu.types";

const menus: DmMenuSchema[] = [
  {
    menuId: 1,
    parentId: 0,
    productId: 1,
    menuName: "Cloud",
    menuNameEn: "Cloud EN",
    menuUrl: "/cloud",
    menuNum: 2,
    iconStr: "C",
    children: [
      {
        menuId: 2,
        parentId: 1,
        productId: 1,
        menuName: "Instances",
        menuNameEn: "Instances EN",
        menuUrl: "/cloud/instances",
        menuNum: 1,
      },
      {
        menuId: 3,
        parentId: 1,
        productId: 1,
        menuName: "Hidden route",
        menuUrl: "/cloud/instances/:id",
        subRouter: true,
      },
    ],
  },
  {
    menuId: 4,
    parentId: 0,
    productId: 1,
    menuName: "Disabled",
    menuUrl: "/disabled",
    menuNum: 1,
    enable: false,
  },
];

describe("DmMenu", () => {
  test("converts workflow menu schema into local menu items", () => {
    const items = createDmMenuItems(menus, "en-US");

    expect(items).toHaveLength(1);
    expect(items[0]?.label).toBe("Cloud EN");
    expect(items[0]?.children).toHaveLength(1);
    expect(items[0]?.children?.[0]?.key).toBe("/cloud/instances");
  });

  test("renders product header, selected/open keys, and collapse action", () => {
    let collapsed = 0;
    const { container } = render(
      <DmMenu
        menus={menus}
        productTitle="DNS"
        selectedKeys={["/cloud/instances"]}
        openKeys={["/cloud"]}
        onCollapsed={() => {
          collapsed += 1;
        }}
      />,
    );

    expect(container.querySelector(".dm-menu")).toBeTruthy();
    expect(screen.getByText("DNS")).toBeTruthy();
    expect(screen.getByText("Instances").closest("li")?.className).toContain(
      "menu-item-active",
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
    expect(collapsed).toBe(1);
  });

  test("reports clicked schema item and supports collapsed/no-header mode", () => {
    let clickedKey = "";
    let clickedName = "";
    const { container } = render(
      <DmMenu
        menus={menus}
        hideProductHeader
        inlineCollapsed
        openKeys={["/cloud"]}
        onClick={(info) => {
          clickedKey = info.key;
          clickedName = info.menu?.menuName ?? "";
        }}
      />,
    );

    expect(container.querySelector(".dm-menu-no-header")).toBeTruthy();
    expect(container.querySelector(".dm-menu-collapsed")).toBeTruthy();
    expect(screen.queryByText("DuskMoon")).toBeNull();

    fireEvent.click(screen.getByText("Instances"));
    expect(clickedKey).toBe("/cloud/instances");
    expect(clickedName).toBe("Instances");
  });
});
