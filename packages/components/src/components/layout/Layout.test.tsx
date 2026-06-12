import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Layout } from "./Layout";

describe("Layout", () => {
  test("renders root and static sections with quiet classes", () => {
    const { container } = render(
      <Layout hasSider className="custom-layout" data-testid="layout">
        <Layout.Header>Header</Layout.Header>
        <Layout.Sider>Sider</Layout.Sider>
        <Layout.Content>Content</Layout.Content>
        <Layout.Footer>Footer</Layout.Footer>
      </Layout>,
    );

    const root = container.firstElementChild as HTMLElement;

    expect(root.className).toContain("layout");
    expect(root.className).toContain("layout-has-sider");
    expect(root.className).toContain("custom-layout");
    expect(screen.getByText("Header").className).toContain("layout-header");
    expect(screen.getByText("Sider").className).toContain("layout-sider");
    expect(screen.getByText("Content").className).toContain("layout-content");
    expect(screen.getByText("Footer").className).toContain("layout-footer");
  });

  test("passes native div props and style through root", () => {
    render(
      <Layout id="shell" data-testid="layout" style={{ minHeight: 320 }} />,
    );

    const root = screen.getByTestId("layout");

    expect(root.id).toBe("shell");
    expect(root.style.minHeight).toBe("320px");
  });

  test("supports uncontrolled sider collapse from defaultCollapsed", () => {
    const { container } = render(
      <Layout.Sider collapsible defaultCollapsed>
        Nav
      </Layout.Sider>,
    );

    const sider = container.firstElementChild as HTMLElement;

    expect(sider.className).toContain("layout-sider-collapsed");
    expect(sider.style.width).toBe("80px");

    fireEvent.click(screen.getByRole("button", { name: "Expand sider" }));

    expect(sider.className).not.toContain("layout-sider-collapsed");
    expect(sider.style.width).toBe("200px");
  });

  test("supports controlled sider collapse and reports trigger changes", () => {
    const calls: Array<[boolean, string]> = [];
    const { container } = render(
      <Layout.Sider
        collapsible
        collapsed={false}
        width={240}
        collapsedWidth={64}
        trigger="toggle"
        onCollapse={(nextCollapsed, type) => {
          calls.push([nextCollapsed, type]);
        }}
      >
        Nav
      </Layout.Sider>,
    );

    const sider = container.firstElementChild as HTMLElement;

    expect(sider.style.width).toBe("240px");
    expect(screen.getByText("toggle").className).toContain("layout-trigger");

    fireEvent.click(screen.getByRole("button", { name: "Collapse sider" }));

    expect(calls).toEqual([[true, "clickTrigger"]]);
    expect(sider.className).not.toContain("layout-sider-collapsed");
  });

  test("omits trigger when trigger is null", () => {
    render(
      <Layout.Sider collapsible trigger={null}>
        Nav
      </Layout.Sider>,
    );

    expect(screen.queryByRole("button")).toBeNull();
  });
});
