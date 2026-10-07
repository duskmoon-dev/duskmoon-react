import React, { createRef } from "react";
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

  test("keeps the primary action separate from the menu trigger", () => {
    let actions = 0;
    const changes: boolean[] = [];

    const { container } = render(
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
    const popup = container.querySelector(".dropdown-content[popover]")!;
    sendToggle(popup, "open");
    expect(actions).toBe(1);
    expect(changes).toEqual([true]);
    expect(popup.querySelector(".menu-item")).toBeTruthy();
  });

  test("forwards button styling and preserves a wrapped trigger and ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const changes: boolean[] = [];

    const { container } = render(
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
    expect(trigger.closest("button button")).toBeNull();
    const popup = container.querySelector<HTMLElement>(
      ".dropdown-content[popover]",
    )!;
    let showCalls = 0;
    popup.showPopover = () => {
      showCalls += 1;
    };
    fireEvent.click(trigger);
    expect(showCalls).toBe(1);
    sendToggle(popup, "open");
    expect(changes).toEqual([true]);
    expect(popup.className).not.toContain("dropdown-open");
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
