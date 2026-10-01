import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { ConsolePage } from "./ConsolePage";

describe("ConsolePage", () => {
  test("maps explicit sidebar state and native mobile navigation", () => {
    render(
      <ConsolePage sidebarState="compact" data-testid="page">
        <ConsolePage.Frame>
          <ConsolePage.Appbar>
            <ConsolePage.SidebarToggle onClick={() => {}} />
            <ConsolePage.MobileTrigger aria-label="Open navigation" />
            <ConsolePage.MobileMenu aria-label="Console navigation">
              <a href="#overview">Overview</a>
            </ConsolePage.MobileMenu>
          </ConsolePage.Appbar>
          <ConsolePage.Sidebar>
            <ConsolePage.SidebarBody aria-label="Sections">
              <a href="#overview">Overview</a>
            </ConsolePage.SidebarBody>
          </ConsolePage.Sidebar>
          <ConsolePage.Main>Workspace</ConsolePage.Main>
        </ConsolePage.Frame>
      </ConsolePage>,
    );

    expect(screen.getByTestId("page").className).toContain(
      "console-page-sidebar-compact",
    );
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeDefined();
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    const menu = document.getElementById(
      trigger.getAttribute("popovertarget") ?? "",
    );
    expect(menu?.getAttribute("popover")).toBe("auto");
    expect(menu?.getAttribute("style")).toContain("position-anchor");
  });
});
