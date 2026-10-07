import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Megamenu } from "./Megamenu";

function example(label: string) {
  return (
    <Megamenu
      aria-label={label}
      trigger="Products"
      panelHeading="Products"
      panel={<a href="/components">Components</a>}
      mobile={
        <details>
          <summary>Browse products</summary>
          <a href="/components">Components</a>
        </details>
      }
      leading={<a href="/products">All products</a>}
    />
  );
}

describe("Megamenu", () => {
  test("renders a native popover with a linked trigger and unique anchor", () => {
    const { container } = render(
      <div>
        {example("Products navigation")}
        {example("Other navigation")}
      </div>,
    );
    const navs = container.querySelectorAll("nav.megamenu");
    const first = navs[0] as HTMLElement;
    const second = navs[1] as HTMLElement;
    const trigger = first.querySelector(
      "button.megamenu-trigger",
    ) as HTMLButtonElement;
    const panel = first.querySelector(".megamenu-panel") as HTMLElement;
    const secondPanel = second.querySelector(".megamenu-panel") as HTMLElement;

    expect(trigger.type).toBe("button");
    expect(trigger.getAttribute("popovertarget")).toBe(panel.id);
    expect(panel.getAttribute("popover")).toBe("auto");
    expect(panel.getAttribute("aria-labelledby")).toBe(
      (first.querySelector("h2.megamenu-heading") as HTMLHeadingElement).id,
    );
    expect(trigger.style.getPropertyValue("--megamenu-anchor")).toBe(
      panel.style.getPropertyValue("--megamenu-anchor"),
    );
    expect(
      panel.style
        .getPropertyValue("--megamenu-anchor")
        .startsWith("--dm-megamenu-"),
    ).toBe(true);
    expect(panel.id).not.toBe(secondPanel.id);
    expect(first.querySelector("[role=menu]")).toBeNull();
    expect(
      screen.getByRole("navigation", { name: "Products navigation" }),
    ).toBe(first);
  });

  test("renders a mobile disclosure and optional full-width panel", () => {
    const { container } = render(
      <Megamenu
        aria-label="Product navigation"
        trigger="Products"
        panelHeading="Products"
        panel={<a href="/products">Products</a>}
        mobile={
          <details>
            <summary>Browse products</summary>
          </details>
        }
        fullWidth
      />,
    );
    expect(container.querySelector(".megamenu-panel-full")).toBeTruthy();
    expect(
      container.querySelector(".megamenu-mobile details summary")?.textContent,
    ).toBe("Browse products");
    expect(
      container.querySelector(".megamenu-bar.megamenu-desktop"),
    ).toBeTruthy();
  });
});
