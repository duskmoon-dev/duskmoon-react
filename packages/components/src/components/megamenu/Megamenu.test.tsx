import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { Megamenu } from "./Megamenu";

describe("Megamenu", () => {
  test("gives each native popover pair a unique ID and CSS anchor", () => {
    render(
      <Megamenu aria-label="Primary">
        <Megamenu.Bar>
          {["Products", "Resources"].map((name) => (
            <Megamenu.Item key={name}>
              <Megamenu.Trigger>{name}</Megamenu.Trigger>
              <Megamenu.Panel>
                <Megamenu.Heading>{name}</Megamenu.Heading>
              </Megamenu.Panel>
            </Megamenu.Item>
          ))}
        </Megamenu.Bar>
      </Megamenu>,
    );

    const buttons = ["Products", "Resources"].map((name) =>
      screen.getByRole("button", { name }),
    );
    const targets = buttons.map((button) =>
      button.getAttribute("popovertarget"),
    );
    expect(new Set(targets).size).toBe(2);
    for (const button of buttons) {
      const item = button.closest("li");
      const panel = item?.querySelector("[popover]");
      expect(panel?.id ?? null).toBe(button.getAttribute("popovertarget"));
      expect(panel?.getAttribute("popover")).toBe("auto");
      expect(item?.getAttribute("style")).toContain("--megamenu-anchor");
    }
  });
});
