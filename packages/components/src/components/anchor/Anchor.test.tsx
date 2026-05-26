import React from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Anchor } from "./Anchor";

describe("Anchor", () => {
  test("renders nested item links and tracks active href on click", () => {
    let changed = "";
    let clicked = "";

    const { container } = render(
      <Anchor
        items={[
          {
            href: "#one",
            title: "One",
            children: [{ href: "#two", title: "Two", target: "_blank" }],
          },
        ]}
        showInkInFixed
        onClick={(_event, link) => {
          clicked = link.href;
        }}
        onChange={(href) => {
          changed = href;
        }}
      />,
    );

    expect(screen.getByRole("navigation")).toBeTruthy();
    expect(screen.getByText("Two").getAttribute("href")).toBe("#two");
    expect(screen.getByText("Two").getAttribute("target")).toBe("_blank");

    fireEvent.click(screen.getByText("Two"));

    expect(clicked).toBe("#two");
    expect(changed).toBe("#two");
    expect(container.querySelector(".anchor-link-active")?.textContent).toBe(
      "Two",
    );
    expect(container.querySelector(".anchor-ink-visible")).toBeTruthy();
  });

  test("supports Anchor.Link children and hash changes", () => {
    render(
      <Anchor affix={false}>
        <Anchor.Link href="#intro" title="Intro" />
        <Anchor.Link href="#api" title="API" />
      </Anchor>,
    );

    act(() => {
      window.location.hash = "#api";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(screen.getByText("API").getAttribute("aria-current")).toBe(
      "location",
    );
  });

  test("accepts nav props, className, ref, and getCurrentAnchor", () => {
    const ref = React.createRef<HTMLElement>();
    const { container } = render(
      <Anchor
        ref={ref}
        aria-label="Page sections"
        className="custom-anchor"
        getCurrentAnchor={(href) => (href === "#alias" ? "#real" : href)}
      >
        <Anchor.Link href="#real" title="Real" />
        <Anchor.Link href="#alias" title="Alias" />
      </Anchor>,
    );

    fireEvent.click(screen.getByText("Alias"));

    expect(ref.current?.className).toContain("anchor");
    expect(ref.current?.className).toContain("custom-anchor");
    expect(screen.getByRole("navigation", { name: "Page sections" })).toBe(
      ref.current as HTMLElement,
    );
    expect(container.querySelector(".anchor-link-active")?.textContent).toBe(
      "Real",
    );
  });
});
