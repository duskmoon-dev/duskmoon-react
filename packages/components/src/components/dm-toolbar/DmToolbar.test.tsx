import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmToolbar } from "./DmToolbar";

describe("DmToolbar", () => {
  test("renders secondary actions before primary actions", () => {
    const { container } = render(
      <DmToolbar
        items={[
          { key: "export", title: "Export" },
          { key: "delete", title: "Delete" },
          { key: "create", title: "Create", type: "primary" },
        ]}
      />,
    );

    expect(container.querySelector(".dm-toolbar")).toBeTruthy();

    const buttons = screen.getAllByRole("button").map((button) => button.textContent);

    expect(buttons).toEqual(["Export", "Delete", "Create"]);
    expect(screen.getByRole("button", { name: "Create" }).className).toContain(
      "btn-primary",
    );
  });

  test("collapses older secondary actions into More overflow", () => {
    let exported = false;

    const { container } = render(
      <DmToolbar
        maxVisibleSecondaryItems={1}
        items={[
          {
            key: "export",
            title: "Export",
            onClick: () => {
              exported = true;
            },
          },
          { key: "delete", title: "Delete" },
          { key: "create", title: "Create", type: "primary" },
        ]}
      />,
    );

    const visibleSecondary = Array.from(
      container.querySelectorAll(".dm-toolbar-secondary-item"),
    ).map((item) => item.textContent);

    expect(visibleSecondary).toEqual(["Delete"]);
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "More" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "More" }));
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(exported).toBe(true);
  });

  test("supports custom more text and all-secondary overflow", () => {
    const { container } = render(
      <DmToolbar
        moreText="Actions"
        maxVisibleSecondaryItems={0}
        items={[
          { key: "edit", title: "Edit" },
          { key: "archive", title: "Archive" },
          { key: "save", title: "Save", type: "primary" },
        ]}
      />,
    );

    expect(container.querySelectorAll(".dm-toolbar-secondary-item")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
  });

  test("renders item dropdown menus with local Dropdown primitive", () => {
    render(
      <DmToolbar
        items={[
          {
            key: "more",
            title: "More item",
            menu: {
              items: [{ key: "copy", label: "Copy" }],
            },
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "More item" }));

    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });
});
