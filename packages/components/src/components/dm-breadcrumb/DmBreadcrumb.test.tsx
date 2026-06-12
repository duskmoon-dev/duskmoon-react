import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmBreadcrumb } from "./DmBreadcrumb";

describe("DmBreadcrumb", () => {
  test("renders Dm classes, values, and link items", () => {
    const { container } = render(
      <DmBreadcrumb
        compact
        items={[
          { title: "Cloud", url: "/cloud" },
          { title: "Zone", value: "example.com" },
        ]}
      />,
    );

    expect(container.querySelector(".dm-breadcrumb")).toBeTruthy();
    expect(container.querySelector(".dm-breadcrumb-compact")).toBeTruthy();
    expect(screen.getByText("Cloud").closest("a")?.getAttribute("href")).toBe(
      "/cloud",
    );
    expect(screen.getByText("(example.com)").className).toContain(
      "dm-breadcrumb-value",
    );
  });

  test("uses recent path search when storage path is enabled", () => {
    let clickedUrl = "";

    render(
      <DmBreadcrumb
        history={[{ pathname: "/zones", search: "?page=3" }]}
        items={[
          {
            title: "Zones",
            url: "/zones",
            onClick: (url) => {
              clickedUrl = url;
            },
          },
          { title: "Detail" },
        ]}
      />,
    );

    fireEvent.click(screen.getByText("Zones"));
    expect(clickedUrl).toBe("/zones?page=3");
  });

  test("collapses middle items for compact breadcrumb trails", () => {
    const { container } = render(
      <DmBreadcrumb
        maxVisibleItems={4}
        items={[
          { title: "One", url: "/one" },
          { title: "Two", url: "/two" },
          { title: "Three", url: "/three" },
          { title: "Four", url: "/four" },
          { title: "Five" },
        ]}
      />,
    );

    expect(screen.getByText("...")).toBeTruthy();
    expect(screen.queryByText("Three")).toBeNull();
    expect(
      container.querySelectorAll(".breadcrumb-separator").length,
    ).toBeGreaterThan(0);
  });
});
