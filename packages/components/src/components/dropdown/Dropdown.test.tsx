import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

describe("Dropdown", () => {
  test("renders menu items from menu prop", () => {
    render(
      <Dropdown
        open
        menu={{
          items: [
            { key: "edit", label: "Edit" },
            { key: "delete", label: "Delete", danger: true },
          ],
        }}
      >
        <button type="button">Actions</button>
      </Dropdown>,
    );

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
  });

  test("toggles open state on click trigger", () => {
    render(
      <Dropdown
        destroyPopupOnHide
        trigger={["click"]}
        menu={{ items: [{ key: "edit", label: "Edit" }] }}
      >
        <button type="button">Actions</button>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });

    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(trigger.parentElement as HTMLElement);
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(trigger.parentElement as HTMLElement);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("calls menu onClick and closes uncontrolled popup", () => {
    let selectedKey = "";

    render(
      <Dropdown
        defaultOpen
        destroyPopupOnHide
        menu={{
          items: [{ key: "edit", label: "Edit" }],
          onClick: ({ key }) => {
            selectedKey = key;
          },
        }}
      >
        <button type="button">Actions</button>
      </Dropdown>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(selectedKey).toBe("edit");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  test("exposes Dropdown.Button", () => {
    render(
      <Dropdown.Button menu={{ items: [{ key: "edit", label: "Edit" }] }}>
        More
      </Dropdown.Button>,
    );

    expect(screen.getByRole("button", { name: "More" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open dropdown" })).toBeTruthy();
  });
});
