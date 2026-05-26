import React from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BackTop } from "./BackTop";

describe("BackTop", () => {
  test("becomes visible after target scroll and scrolls target to top", () => {
    const target = document.createElement("div");
    let scrollTop = 0;
    Object.defineProperty(target, "scrollTop", {
      get: () => scrollTop,
      set: (value) => {
        scrollTop = value;
      },
    });
    target.scrollTo = ((options?: ScrollToOptions | number) => {
      const top = typeof options === "number" ? options : options?.top;
      scrollTop = Number(top);
    }) as typeof target.scrollTo;

    render(
      <BackTop visibilityHeight={10} target={() => target}>
        Up
      </BackTop>,
    );

    const button = screen.getByRole("button", { hidden: true });
    expect((button as HTMLButtonElement).hidden).toBe(true);

    act(() => {
      scrollTop = 20;
      target.dispatchEvent(new Event("scroll"));
    });

    expect((button as HTMLButtonElement).hidden).toBe(false);
    fireEvent.click(button);
    expect(scrollTop).toBe(0);
  });
});
