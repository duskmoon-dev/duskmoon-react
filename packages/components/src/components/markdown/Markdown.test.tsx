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

  describe("CJK-aware autolinks", () => {
    const links = (markdown: string) => {
      const { container } = render(<Markdown markdown={markdown} />);
      return Array.from(container.querySelectorAll("a")).map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent,
      }));
    };

    test("ends a bare URL at full-width punctuation", () => {
      const { container } = render(
        <Markdown markdown="运行 curl -sI https://example.com，告诉我状态码" />,
      );
      expect(container.querySelector("a")?.getAttribute("href")).toBe(
        "https://example.com",
      );
      expect(container.querySelector("p")?.textContent).toBe(
        "运行 curl -sI https://example.com，告诉我状态码",
      );
    });

    test("ends a bare URL at CJK ideographs and kana", () => {
      expect(links("见 www.example.com好的 https://a.co/x カタカナ")).toEqual([
        { href: "http://www.example.com", text: "www.example.com" },
        { href: "https://a.co/x", text: "https://a.co/x" },
      ]);
      expect(links("https://a.co/docsです")).toEqual([
        { href: "https://a.co/docs", text: "https://a.co/docs" },
      ]);
    });

    test("drops non-ASCII path text and trailing ASCII punctuation before CJK", () => {
      expect(links("访问https://example.com/路径。")).toEqual([
        { href: "https://example.com/", text: "https://example.com/" },
      ]);
      expect(links("https://example.com/a.，下一句")).toEqual([
        { href: "https://example.com/a", text: "https://example.com/a" },
      ]);
    });

    test("links a second bare URL that follows CJK text", () => {
      expect(links("https://a.com，和https://b.com。")).toEqual([
        { href: "https://a.com", text: "https://a.com" },
        { href: "https://b.com", text: "https://b.com" },
      ]);
    });

    test("leaves explicit, percent-encoded and ASCII autolinks unchanged", () => {
      expect(
        links(
          "<https://a.com/路径> [链接](https://b.com/路径) https://c.com/%E8%B7%AF https://d.com/x, ok",
        ),
      ).toEqual([
        {
          href: "https://a.com/%E8%B7%AF%E5%BE%84",
          text: "https://a.com/路径",
        },
        { href: "https://b.com/%E8%B7%AF%E5%BE%84", text: "链接" },
        { href: "https://c.com/%E8%B7%AF", text: "https://c.com/%E8%B7%AF" },
        { href: "https://d.com/x", text: "https://d.com/x" },
      ]);
    });
  });
});
