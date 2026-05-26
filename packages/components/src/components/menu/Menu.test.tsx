import { describe, expect, mock, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Menu } from "./Menu";

const items = [
  { key: "overview", label: "Overview" },
  { key: "settings", label: "Settings", disabled: true },
  {
    key: "admin",
    label: "Admin",
    children: [
      { key: "users", label: "Users" },
      { key: "roles", label: "Roles" },
    ],
  },
];

describe("Menu", () => {
  test("renders items with DuskMoon menu classes", () => {
    const { container } = render(<Menu items={items} />);

    const root = container.firstElementChild;
    expect(root?.classList.contains("menu")).toBe(true);
    expect(root?.classList.contains("menu-show")).toBe(true);
    expect(screen.getByText("Overview").closest("li")?.className).toContain(
      "menu-item",
    );
  });

  test("supports default selected keys and selection callbacks", () => {
    const onSelect = mock();
    const onClick = mock();

    render(
      <Menu
        items={items}
        defaultSelectedKeys={["overview"]}
        defaultOpenKeys={["admin"]}
        onSelect={onSelect}
        onClick={onClick}
      />,
    );

    expect(screen.getByText("Overview").closest("li")?.className).toContain(
      "menu-item-active",
    );

    fireEvent.click(screen.getByText("Users"));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "users",
        keyPath: ["users", "admin"],
        selectedKeys: ["users"],
      }),
    );
    expect(onClick).toHaveBeenCalled();
  });

  test("supports submenu open state", () => {
    const onOpenChange = mock();

    render(<Menu items={items} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText("Admin"));

    expect(screen.getByText("Users")).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(["admin"]);
  });

  test("supports controlled selected keys", () => {
    render(<Menu items={items} selectedKeys={["overview"]} />);

    expect(screen.getByText("Overview").closest("li")?.className).toContain(
      "menu-item-active",
    );
  });

  test("supports multiple deselect", () => {
    const onDeselect = mock();

    render(
      <Menu
        items={items}
        multiple
        defaultSelectedKeys={["overview"]}
        onDeselect={onDeselect}
      />,
    );

    fireEvent.click(screen.getByText("Overview"));
    expect(onDeselect).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "overview",
        selectedKeys: [],
      }),
    );
  });

  test("applies mode, theme, size, and disabled classes", () => {
    const { container } = render(
      <Menu items={items} mode="inline" theme="dark" size="sm" disabled />,
    );

    const root = container.firstElementChild;
    expect(root?.className).toContain("menu-inline");
    expect(root?.className).toContain("menu-dark");
    expect(root?.className).toContain("menu-compact");
    expect(root?.className).toContain("menu-item-disabled");
  });

  test("exposes static child components", () => {
    render(
      <Menu>
        <Menu.Item icon="i" extra="E">
          Child item
        </Menu.Item>
        <Menu.Divider />
        <Menu.ItemGroup title="Group">
          <Menu.Item>Nested item</Menu.Item>
        </Menu.ItemGroup>
      </Menu>,
    );

    expect(screen.getByText("Child item")).toBeTruthy();
    expect(screen.getByText("Group")).toBeTruthy();
    expect(screen.getByText("Nested item")).toBeTruthy();
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLUListElement>();

    render(<Menu ref={ref} items={items} />);
    expect(ref.current?.className).toContain("menu");
  });
});
