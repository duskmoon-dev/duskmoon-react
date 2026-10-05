import React, { createRef } from "react";
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

    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeTruthy();

    fireEvent.click(trigger);
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

  test("keeps the primary action separate from the menu trigger", () => {
    let actions = 0;
    const changes: boolean[] = [];

    render(
      <Dropdown.Button
        destroyPopupOnHide
        menu={{ items: [{ key: "edit", label: "Edit" }] }}
        onClick={() => {
          actions += 1;
        }}
        onOpenChange={(open) => changes.push(open)}
      >
        Save
      </Dropdown.Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(actions).toBe(1);
    expect(changes).toEqual([]);
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Open dropdown" }));
    expect(actions).toBe(1);
    expect(changes).toEqual([true]);
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  test("forwards button styling and preserves a wrapped trigger and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const changes: boolean[] = [];

    render(
      <Dropdown.Button
        ref={ref}
        color="error"
        appearance="outline"
        size="sm"
        leftIcon={
          <span data-testid="primary-icon" aria-hidden="true">
            !
          </span>
        }
        open={false}
        onOpenChange={(open) => changes.push(open)}
        buttonsRender={([primary, trigger]) => [
          primary,
          <span key="wrapped-trigger" title="More actions">
            {trigger}
          </span>,
        ]}
        menu={{ items: [{ key: "delete", label: "Delete" }] }}
      >
        Delete record
      </Dropdown.Button>,
    );

    const primary = screen.getByRole("button", { name: "Delete record" });
    const trigger = screen.getByRole("button", { name: "Open dropdown" });
    expect(ref.current?.classList.contains("dropdown-button")).toBe(true);
    expect(primary.className).toContain("btn-error");
    expect(primary.className).toContain("btn-outline");
    expect(primary.className).toContain("btn-sm");
    expect(trigger.className).toContain("btn-error");
    expect(trigger.className).toContain("btn-outline");
    expect(trigger.className).toContain("btn-sm");
    expect(screen.getByTestId("primary-icon")).toBeTruthy();
    fireEvent.click(trigger);
    expect(changes).toEqual([true]);
    expect(screen.getByRole("menu").className).not.toContain("dropdown-open");
  });

  test("disables both split controls while loading", () => {
    render(
      <Dropdown.Button isLoading menu={{ items: [] }}>
        Save
      </Dropdown.Button>,
    );

    expect(
      screen.getByRole("button", { name: "Save" }).hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Open dropdown" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
