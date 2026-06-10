import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmDrawer } from "./DmDrawer";

describe("DmDrawer", () => {
  test("wraps Drawer with Dm class names and right placement defaults", () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(
      <DmDrawer ref={ref} open title="Edit record">
        <p>Drawer body</p>
      </DmDrawer>,
    );

    const drawer = container.querySelector(".drawer");

    expect(drawer?.className).toContain("dm-drawer");
    expect(drawer?.className).toContain("drawer-right");
    expect(ref.current?.className).toContain("dm-drawer");
    expect(screen.getByText("Edit record")).toBeTruthy();
    expect(screen.getByText("Drawer body")).toBeTruthy();
  });

  test("renders submit footer from footerText and calls onSubmit", () => {
    let submitted = false;

    render(
      <DmDrawer
        open
        footerText="Save"
        onSubmit={() => {
          submitted = true;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(submitted).toBe(true);
    expect(screen.getByRole("button", { name: "Save" }).className).toContain(
      "dm-drawer-footer-action",
    );
  });

  test("prefers custom footer over submit footer", () => {
    render(
      <DmDrawer open footer={<button>Custom action</button>} footerText="Save" />,
    );

    expect(screen.getByRole("button", { name: "Custom action" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  test("keeps close behavior and supports submit disabled state", () => {
    let closed = false;

    render(
      <DmDrawer
        open
        title="Details"
        footerText="Submit"
        submitDisabled
        onClose={() => {
          closed = true;
        }}
      />,
    );

    expect(
      (screen.getByRole("button", { name: "Submit" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(closed).toBe(true);
  });
});
