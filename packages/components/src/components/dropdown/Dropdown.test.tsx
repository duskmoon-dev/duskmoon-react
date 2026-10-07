import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown } from "./Dropdown";

function sendToggle(popup: Element, newState: "open" | "closed") {
  const event = new Event("toggle", { bubbles: true });
  Object.defineProperty(event, "newState", { value: newState });
  fireEvent(popup, event);
}

describe("Dropdown", () => {
  test("connects a real trigger button to a native popover", () => {
    const { container } = render(
      <Dropdown
        placement="topRight"
        menu={{ items: [{ key: "edit", label: "Edit" }] }}
      >
        <button type="button">Actions</button>
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    const wrapper = container.querySelector(".dropdown");
    const popup = wrapper?.querySelector(":scope > .dropdown-content[popover]");

    expect(wrapper?.classList.contains("dropdown-block-start")).toBe(true);
    expect(trigger.getAttribute("popovertarget")).toBe(popup?.id ?? null);
    expect(trigger.getAttribute("aria-controls")).toBe(popup?.id ?? null);
    expect((trigger as HTMLButtonElement).style.anchorName).toBe(
      (popup as HTMLElement).style.positionAnchor,
    );
    expect(screen.queryByRole("menu")).toBeNull();
    expect(popup?.querySelector(".dropdown-menu .menu-item")?.textContent).toBe(
      "Edit",
    );
  });

  test("closes after item selection", () => {
    const transitions: boolean[] = [];
    let selectedKey = "";
    const { container } = render(
      <Dropdown
        destroyPopupOnHide
        onOpenChange={(next) => transitions.push(next)}
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

    const popup = container.querySelector(".dropdown-content[popover]")!;
    expect(popup.querySelector(".menu-item")).toBeNull();

    sendToggle(popup, "open");
    expect(
      screen
        .getByRole("button", { name: "Actions" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(selectedKey).toBe("edit");
    expect(popup.querySelector(".menu-item")).toBeNull();

    expect(transitions).toEqual([true, false]);
  });

  test("tracks native light dismissal", () => {
    const transitions: boolean[] = [];
    const { container } = render(
      <Dropdown onOpenChange={(next) => transitions.push(next)}>
        <button type="button">Actions</button>
      </Dropdown>,
    );

    const popup = container.querySelector(".dropdown-content[popover]")!;
    sendToggle(popup, "open");
    sendToggle(popup, "closed");

    expect(transitions).toEqual([true, false]);
    expect(
      screen
        .getByRole("button", { name: "Actions" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  test("keeps controlled open state until the parent changes it", () => {
    const transitions: boolean[] = [];
    const { container } = render(
      <Dropdown
        open
        onOpenChange={(next) => transitions.push(next)}
        menu={{ items: [{ key: "edit", label: "Edit" }] }}
      >
        <button type="button">Actions</button>
      </Dropdown>,
    );

    const popup = container.querySelector(".dropdown-content[popover]")!;
    sendToggle(popup, "closed");
    expect(transitions).toEqual([false]);
    expect(
      screen
        .getByRole("button", { name: "Actions" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  test("uses only the secondary button to invoke Dropdown.Button", () => {
    const { container } = render(
      <Dropdown.Button menu={{ items: [{ key: "edit", label: "Edit" }] }}>
        More
      </Dropdown.Button>,
    );

    const primary = screen.getByRole("button", { name: "More" });
    const trigger = screen.getByRole("button", { name: "Open dropdown" });
    const popup = container.querySelector(".dropdown-content[popover]");

    expect(primary.hasAttribute("popovertarget")).toBe(false);
    expect(trigger.getAttribute("popovertarget")).toBe(popup?.id ?? null);
  });

  test("disables native invocation when disabled", () => {
    const { container } = render(
      <Dropdown disabled menu={{ items: [] }}>
        Actions
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger.hasAttribute("disabled")).toBe(true);
    expect(trigger.hasAttribute("popovertarget")).toBe(false);
    expect(container.querySelector(".dropdown-content[popover]")).toBeTruthy();
  });
});
