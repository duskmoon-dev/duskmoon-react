import React from "react";
import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { Affix } from "./Affix";

describe("Affix", () => {
  test("renders children and toggles fixed state on target scroll", () => {
    let changed: boolean | undefined;
    const target = document.createElement("div");
    Object.defineProperty(target, "scrollTop", {
      value: 0,
      writable: true,
    });

    const { container } = render(
      <Affix offsetTop={10} target={() => target} onChange={(fixed) => {
        changed = fixed;
      }}>
        <button type="button">Pinned</button>
      </Affix>,
    );

    expect(screen.getByRole("button", { name: "Pinned" })).toBeTruthy();

    act(() => {
      target.scrollTop = 20;
      target.dispatchEvent(new Event("scroll"));
    });

    const affix = container.querySelector(".affix") as HTMLDivElement;
    expect(changed).toBe(true);
    expect(affix.className).toContain("affix-fixed");
    expect(affix.style.position).toBe("fixed");
  });
});
