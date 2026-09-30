import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmPageHeader } from "./DmPageHeader";

describe("DmPageHeader", () => {
  test("renders title, body, and Dm page header classes", () => {
    const { container } = render(
      <DmPageHeader title="Zone detail">
        <p>Body content</p>
      </DmPageHeader>,
    );

    expect(container.querySelector(".dm-page-header")).toBeTruthy();
    expect(screen.getByText("Zone detail")).toBeTruthy();
    expect(screen.getByText("Body content")).toBeTruthy();
  });

  test("renders title form items with custom separator", () => {
    render(
      <DmPageHeader
        title={[
          { title: "Name", value: "example.com" },
          { title: "Status", value: "Enabled" },
        ]}
        titleSeparator="="
      />,
    );

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("example.com")).toBeTruthy();
    expect(screen.getAllByText("=")).toHaveLength(2);
  });

  test("renders back affordance and invokes callback", () => {
    let back = false;

    render(
      <DmPageHeader
        title="Detail"
        backClick={() => {
          back = true;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(back).toBe(true);
  });

  test("renders breadcrumb and toolbar extra props", () => {
    const { container } = render(
      <DmPageHeader
        title="Detail"
        breadcrumb={{
          items: [{ title: "Home", href: "/" }, { title: "Detail" }],
        }}
        extra={{
          items: [
            { key: "secondary", title: "Export" },
            { key: "primary", title: "Create", type: "primary" },
          ],
        }}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeTruthy();
    expect(screen.getByText("Home")).toBeTruthy();
    expect(container.querySelector(".dm-toolbar")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create" })).toBeTruthy();
  });
});
