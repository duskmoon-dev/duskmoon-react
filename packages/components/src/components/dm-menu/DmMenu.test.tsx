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

  test("uses a square ghost icon control while preserving collapse semantics", () => {
    let calls = 0;
    const { rerender } = render(<DmMenu onCollapsed={() => calls++} />);
    const collapse = screen.getByRole("button", { name: "Collapse menu" });
    expect(collapse.classList.contains("btn-ghost")).toBe(true);
    expect(collapse.classList.contains("btn-square")).toBe(true);
    expect(collapse.textContent).toBe("");
    expect(collapse.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
    fireEvent.click(collapse);
    expect(calls).toBe(1);
    rerender(<DmMenu inlineCollapsed onCollapsed={() => calls++} />);
    fireEvent.click(screen.getByRole("button", { name: "Expand menu" }));
    expect(calls).toBe(2);
  });

  test("compact product and custom menu items keep full names with supplied icons or initials", () => {
    const title = "A very long product title";
    const clicked: string[] = [];
    const { container, rerender } = render(
      <DmMenu
        inlineCollapsed
        productTitle={title}
        productIcon={<svg data-testid="brand-icon" />}
        items={[
          { key: "activity", label: "Activity overview" },
          {
            key: "settings",
            label: "Settings and preferences",
            icon: <svg data-testid="settings-icon" />,
          },
        ]}
        onClick={(info) => clicked.push(info.key)}
      />,
    );
    expect(screen.getByRole("menuitem", { name: title })).toBeTruthy();
    expect(screen.getByTestId("brand-icon")).toBeTruthy();
    const activity = screen.getByRole("menuitem", {
      name: "Activity overview",
    });
    expect(activity.querySelector(".dm-menu-item-initial")?.textContent).toBe(
      "A",
    );
    expect(activity.querySelector('[aria-hidden="true"]')).toBeTruthy();
    expect(
      screen
        .getByRole("menuitem", { name: "Settings and preferences" })
        .querySelector(".dm-menu-item-initial"),
    ).toBeNull();
    expect(screen.getByTestId("settings-icon")).toBeTruthy();
    fireEvent.keyDown(activity, { key: "Enter" });
    expect(clicked).toEqual(["activity"]);
    rerender(<DmMenu inlineCollapsed productTitle={title} />);
    expect(
      screen
        .getByRole("menuitem", { name: title })
        .querySelector(".dm-menu-item-initial")?.textContent,
    ).toBe("A");
    expect(container.querySelector(".dm-menu-item-label")?.textContent).toBe(
      title,
    );
  });
});
