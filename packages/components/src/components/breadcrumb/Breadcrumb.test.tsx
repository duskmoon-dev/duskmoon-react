import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbItemRender } from "./Breadcrumb.types";

describe("Breadcrumb", () => {
  test("renders items with links, current item, and default separator", () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { title: "Home", href: "/" },
          { title: "Projects", path: "projects" },
          { title: "DuskMoon" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(container.querySelector(".breadcrumbs")).toBeTruthy();
    expect(screen.getByText("Home").closest("a")?.getAttribute("href")).toBe(
      "/",
    );
    expect(
      screen.getByText("Projects").closest("a")?.getAttribute("href"),
    ).toBe("/projects");
    expect(screen.getByText("DuskMoon").closest("span")?.className).toContain(
      "breadcrumb-item-active",
    );
    expect(container.querySelectorAll(".breadcrumb-separator")).toHaveLength(2);
  });

  test("supports route-style data, params, custom separator, and itemRender", () => {
    const itemRender: BreadcrumbItemRender = (
      route,
      params,
      _routes,
      paths,
    ) => (
      <a href={`/${paths.join("/")}`}>
        {route.breadcrumbName}:{params.id}
      </a>
    );

    render(
      <Breadcrumb
        routes={[
          { path: "projects", breadcrumbName: "Projects" },
          { path: ":id", breadcrumbName: "Detail" },
        ]}
        params={{ id: "42" }}
        separator=">"
        itemRender={itemRender}
      />,
    );

    expect(screen.getByText("Projects:42").getAttribute("href")).toBe(
      "/projects",
    );
    expect(screen.getByText("Detail:42").getAttribute("href")).toBe(
      "/projects/42",
    );
    expect(screen.getByText(">")).toBeTruthy();
  });

  test("renders menu item data with click payloads", () => {
    let clickedKey: React.Key | undefined;

    render(
      <Breadcrumb
        items={[
          {
            title: "Workspace",
            menu: {
              items: [
                { key: "alpha", label: "Alpha", href: "/alpha" },
                { key: "beta", label: "Beta", disabled: true },
              ],
              onClick: ({ key }) => {
                clickedKey = key;
              },
            },
          },
          { title: "Current" },
        ]}
      />,
    );

    expect(screen.getByText("Workspace").closest("summary")).toBeTruthy();
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Alpha" })).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: "Alpha" }));

    expect(clickedKey).toBe("alpha");
    expect(
      screen
        .getByRole("menuitem", { name: "Beta" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
  });

  test("supports explicit separator items, className, and ref", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <Breadcrumb
        ref={ref}
        className="custom-breadcrumb"
        items={[
          { title: "One" },
          { type: "separator", separator: "|" },
          { title: "Two" },
        ]}
      />,
    );

    expect(ref.current?.className).toContain("breadcrumbs");
    expect(ref.current?.className).toContain("custom-breadcrumb");
    expect(screen.getByText("|")).toBeTruthy();
    expect(container.querySelectorAll(".breadcrumb-separator")).toHaveLength(1);
  });
});
