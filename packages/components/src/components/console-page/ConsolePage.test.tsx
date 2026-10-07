import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ConsolePage } from "./ConsolePage";

describe("ConsolePage", () => {
  test("places application slots in the Core layout structure", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <ConsolePage
        ref={ref}
        id="workspace"
        appBar={<h1>Workspace</h1>}
        sidebarHeader="Product"
        sidebar={<nav aria-label="Sections">Navigation</nav>}
        sidebarFooter="Account"
      >
        <p>Dashboard</p>
      </ConsolePage>,
    );

    const root = container.querySelector(".console-page") as HTMLDivElement;
    expect(ref.current).toBe(root);
    expect(root.id).toBe("workspace");
    expect(root.querySelector(".console-page-frame")).toBeTruthy();
    expect(
      root.querySelector("header.console-page-appbar h1")?.textContent,
    ).toBe("Workspace");
    expect(
      root.querySelector(".console-page-sidebar-header")?.textContent,
    ).toBe("Product");
    expect(
      screen
        .getByRole("navigation", { name: "Sections" })
        .closest(".console-page-sidebar-body"),
    ).toBeTruthy();
    expect(
      root.querySelector(".console-page-sidebar-footer")?.textContent,
    ).toBe("Account");
    expect(screen.getByRole("main").textContent).toBe("Dashboard");
  });

  test("reflects caller-owned sidebar mode without changing its content", () => {
    const { container, rerender } = render(
      <ConsolePage sidebarMode="compact" sidebar="Navigation">
        Content
      </ConsolePage>,
    );
    const root = container.querySelector(".console-page") as HTMLDivElement;
    expect(root.classList.contains("console-page-sidebar-compact")).toBe(true);

    rerender(
      <ConsolePage sidebarMode="hidden" sidebar="Navigation">
        Content
      </ConsolePage>,
    );
    expect(root.classList.contains("console-page-sidebar-compact")).toBe(false);
    expect(root.classList.contains("console-page-sidebar-hidden")).toBe(true);
    expect(root.querySelector(".console-page-sidebar")?.textContent).toBe(
      "Navigation",
    );
  });
});
