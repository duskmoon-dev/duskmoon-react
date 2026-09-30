import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DmTruncate } from "./DmTruncate";

function defineSize(
  element: Element,
  sizes: Partial<
    Record<"clientWidth" | "scrollWidth" | "scrollHeight", number>
  >,
) {
  for (const [key, value] of Object.entries(sizes)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
    });
  }
}

describe("DmTruncate", () => {
  test("renders emptyValue and custom class names", () => {
    render(
      <DmTruncate className="custom-truncate" emptyValue="N/A">
        {null}
      </DmTruncate>,
    );

    const root = screen.getByText("N/A").closest(".dm-truncate");

    expect(root?.className).toContain("custom-truncate");
  });

  test("detects single-line overflow and shows overflow tag tooltip", async () => {
    const { container } = render(
      <DmTruncate overflowContent={(value) => `Full: ${value}`}>
        Long content
      </DmTruncate>,
    );

    const root = container.querySelector(".dm-truncate") as HTMLElement;
    const measure = container.querySelector(
      ".dm-truncate-measure",
    ) as HTMLElement;
    defineSize(root, { clientWidth: 60 });
    defineSize(measure, { scrollWidth: 180 });

    fireEvent(window, new Event("resize"));

    await waitFor(() => {
      expect(screen.getByLabelText("Text overflow")).toBeTruthy();
    });

    fireEvent.mouseEnter(screen.getByLabelText("Text overflow"));
    expect(screen.getByRole("tooltip").textContent).toContain(
      "Full: Long content",
    );
  });

  test("uses text tooltip when overflow tag is disabled", async () => {
    const { container } = render(
      <DmTruncate showOverflowTag={false}>Hidden full text</DmTruncate>,
    );

    const root = container.querySelector(".dm-truncate") as HTMLElement;
    const measure = container.querySelector(
      ".dm-truncate-measure",
    ) as HTMLElement;
    defineSize(root, { clientWidth: 80 });
    defineSize(measure, { scrollWidth: 220 });

    fireEvent(window, new Event("resize"));

    await waitFor(() => {
      expect(container.querySelector(".tooltip-wrapper")).toBeTruthy();
    });

    fireEvent.mouseEnter(
      container.querySelector(".tooltip-wrapper") as HTMLElement,
    );
    expect(screen.getByRole("tooltip").textContent).toContain(
      "Hidden full text",
    );
  });

  test("copies string content", async () => {
    const copied: string[] = [];
    const originalClipboard = navigator.clipboard;

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => copied.push(value),
      },
    });

    render(
      <DmTruncate copyable onCopy={(value) => copied.push(`callback:${value}`)}>
        Copy me
      </DmTruncate>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    });
    expect(copied).toEqual(["Copy me", "callback:Copy me"]);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
  });
});
