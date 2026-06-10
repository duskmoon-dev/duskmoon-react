import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tag } from "./Tag";

describe("Tag", () => {
  test("renders with default chip classes", () => {
    render(<Tag>Tag</Tag>);

    const tag = screen.getByText("Tag");

    expect(tag.className).toContain("chip");
    expect(tag.className).toContain("chip-outlined");
  });

  test("applies color class", () => {
    render(<Tag color="success">Success</Tag>);

    expect(screen.getByText("Success").className).toContain("chip-success");
  });

  test("applies custom className", () => {
    render(<Tag className="custom-tag">Tag</Tag>);

    expect(screen.getByText("Tag").className).toContain("custom-tag");
  });

  test("renders icon with chip icon class", () => {
    render(<Tag icon={<span data-testid="tag-icon">i</span>}>With icon</Tag>);

    const icon = screen.getByTestId("tag-icon").closest(".chip-icon");

    expect(icon?.className).toContain("chip-icon");
  });

  test("renders close control and calls onClose", () => {
    let closeEventType: string | undefined;

    render(
      <Tag
        closable
        closeIcon={<span data-testid="close-icon">close</span>}
        onClose={(event) => {
          closeEventType = event.type;
        }}
      >
        Closable
      </Tag>,
    );

    const close = screen.getByRole("button", { name: "Close" });

    expect(close.className).toContain("chip-remove");
    expect(screen.getByTestId("close-icon")).toBeTruthy();

    fireEvent.click(close);

    expect(closeEventType).toBe("click");
  });

  test("Tag.CheckableTag reflects checked state and reports next value", () => {
    let nextChecked: boolean | undefined;

    render(
      <Tag.CheckableTag
        checked
        onChange={(checked) => {
          nextChecked = checked;
        }}
      >
        Checkable
      </Tag.CheckableTag>,
    );

    const tag = screen.getByRole("checkbox");

    expect(tag.className).toContain("chip-selectable");
    expect(tag.className).toContain("chip-selected");
    expect(tag.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(tag);

    expect(nextChecked).toBe(false);
  });
});
