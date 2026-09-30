import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Typography } from "./Typography";

describe("Typography", () => {
  test("renders root and semantic text states", () => {
    const { container } = render(
      <Typography className="copy">
        <Typography.Text type="success" strong italic mark code keyboard>
          Hello
        </Typography.Text>
      </Typography>,
    );

    const root = container.querySelector(".typography") as HTMLElement;
    const text = container.querySelector(".typography-text") as HTMLElement;

    expect(root.className).toContain("copy");
    expect(text.className).toContain("typography-success");
    expect(text.querySelector("strong")).toBeTruthy();
    expect(text.querySelector("em")).toBeTruthy();
    expect(text.querySelector("mark")).toBeTruthy();
    expect(text.querySelector("code")).toBeTruthy();
    expect(text.querySelector("kbd")).toBeTruthy();
  });

  test("renders title level, paragraph, and link", () => {
    render(
      <>
        <Typography.Title level={3}>Heading</Typography.Title>
        <Typography.Paragraph type="secondary">Body</Typography.Paragraph>
        <Typography.Link href="/docs" underline>
          Docs
        </Typography.Link>
      </>,
    );

    expect(screen.getByRole("heading", { level: 3 }).textContent).toContain(
      "Heading",
    );
    expect(screen.getByText("Body").className).toContain(
      "typography-secondary",
    );
    expect(
      screen.getByRole("link", { name: "Docs" }).getAttribute("href"),
    ).toBe("/docs");
  });

  test("supports copyable text", () => {
    const copied: string[] = [];

    render(
      <Typography.Text
        copyable={{
          text: "copy source",
          onCopy: () => copied.push("copied"),
        }}
      >
        Copy me
      </Typography.Text>,
    );

    const button = screen.getByRole("button", { name: "Copy text" });
    expect(button.getAttribute("data-copy-source")).toBe("Copy me");
    fireEvent.click(button);
    expect(copied).toEqual(["copied"]);
    expect(button.textContent).toBe("Copied");
  });

  test("supports editable text save and cancel", () => {
    const changes: string[] = [];
    const cancels: string[] = [];

    render(
      <Typography.Text
        editable={{
          onChange: (value) => changes.push(value),
          onCancel: () => cancels.push("cancel"),
        }}
      >
        Editable
      </Typography.Text>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit text" }));
    fireEvent.change(screen.getByLabelText("Edit text"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save edit" }));
    expect(changes).toEqual(["Updated"]);

    fireEvent.click(screen.getByRole("button", { name: "Edit text" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel edit" }));
    expect(cancels).toEqual(["cancel"]);
  });

  test("supports expandable ellipsis", () => {
    const expanded: boolean[] = [];

    render(
      <Typography.Paragraph
        ellipsis={{
          rows: 2,
          expandable: true,
          suffix: "...",
          onExpand: (_event, info) => expanded.push(info.expanded),
        }}
      >
        Long paragraph
      </Typography.Paragraph>,
    );

    const paragraph = screen.getByText(/Long paragraph/);
    const button = screen.getByRole("button", { name: "Expand" });

    expect(paragraph.textContent).toContain("...");
    fireEvent.click(button);
    expect(expanded).toEqual([true]);
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  test("prevents disabled link navigation", () => {
    const clicks: string[] = [];

    render(
      <Typography.Link
        href="/disabled"
        disabled
        onClick={() => clicks.push("click")}
      >
        Disabled
      </Typography.Link>,
    );

    const link = screen.getByRole("link", { name: "Disabled" });
    expect(link.getAttribute("href")).toBe("/disabled");
    fireEvent.click(link);
    expect(clicks).toEqual([]);
  });
});
