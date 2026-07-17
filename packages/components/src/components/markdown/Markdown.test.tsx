import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./Markdown";

describe("Markdown", () => {
  test("renders GFM and soft line breaks by default", () => {
    const { container } = render(
      <Markdown markdown={"first line\nsecond line\n\n~~removed~~"} />,
    );

    expect(container.querySelector("br")).toBeTruthy();
    expect(container.querySelector("del")?.textContent).toBe("removed");
  });

  test("allows default soft line breaks to be disabled", () => {
    const { container } = render(
      <Markdown markdown={"first line\nsecond line"} breaks={false} />,
    );

    expect(container.querySelector("br")).toBeNull();
    expect(container.querySelector("p")?.textContent).toBe(
      "first line\nsecond line",
    );
  });

  test("adds accessible chips to valid inline CSS colors", () => {
    const { container } = render(
      <Markdown markdown={"`#4C86FC` `rgb(1, 2, 3)` `red`"} />,
    );

    expect(screen.getByRole("img", { name: "Color #4C86FC" })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Color rgb(1, 2, 3)" }),
    ).toBeTruthy();
    expect(container.querySelectorAll(".dm-color-chip")).toHaveLength(2);
  });

  test("does not add chips to fenced code or when disabled", () => {
    const { container, rerender } = render(
      <Markdown markdown={"```css\n#4C86FC\n```"} />,
    );
    expect(container.querySelector(".dm-color-chip")).toBeNull();

    rerender(<Markdown markdown={"`#4C86FC`"} colorChips={false} />);
    expect(container.querySelector(".dm-color-chip")).toBeNull();
  });

  test("renders front matter by default and supports hidden and disabled modes", () => {
    const source = "---\ntitle: Example\n---\n# Document";
    const { container, rerender } = render(<Markdown markdown={source} />);

    expect(container.querySelector(".dm-front-matter")?.textContent).toBe(
      "title: Example",
    );
    expect(screen.getByRole("heading", { name: "Document" })).toBeTruthy();

    rerender(<Markdown markdown={source} frontMatter="hidden" />);
    expect(container.querySelector(".dm-front-matter")).toBeNull();
    expect(screen.getByRole("heading", { name: "Document" })).toBeTruthy();

    rerender(<Markdown markdown={source} frontMatter="disabled" />);
    expect(container.querySelector(".dm-front-matter")).toBeNull();
    expect(container.textContent).toContain("title: Example");
  });

  test("supports variant and root element props", () => {
    const { container } = render(
      <Markdown
        markdown="Hello"
        variant="primary"
        className="custom-markdown"
        data-testid="markdown"
      />,
    );
    const root = screen.getByTestId("markdown");

    expect(root).toBe(container.firstElementChild as HTMLElement);
    expect(root.className).toContain("markdown-body-primary");
    expect(root.className).toContain("custom-markdown");
  });
});
