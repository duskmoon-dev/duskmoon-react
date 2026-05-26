import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  test("renders z-design parity input props", () => {
    render(
      <Input
        className="custom-input"
        style={{ width: 120 }}
        disabled
        placeholder="Name"
      />,
    );

    const input = screen.getByPlaceholderText("Name") as HTMLInputElement;

    expect(input.className).toContain("input");
    expect(input.className).toContain("input-outlined");
    expect(input.className).toContain("custom-input");
    expect(input.disabled).toBe(true);
    expect(input.style.width).toBe("120px");
  });

  test("supports status, size, variant, prefix, and suffix", () => {
    render(
      <Input
        prefix={<span data-testid="prefix">@</span>}
        suffix={<span data-testid="suffix">ok</span>}
        status="error"
        size="lg"
        variant="filled"
        defaultValue="value"
      />,
    );

    const input = screen.getByDisplayValue("value");
    const wrapper = input.closest(".input-wrapper");

    expect(input.className).toContain("input-filled");
    expect(input.className).toContain("input-lg");
    expect(input.className).toContain("input-error");
    expect(wrapper?.className).toContain("input-affix-wrapper");
    expect(screen.getByTestId("prefix")).toBeTruthy();
    expect(screen.getByTestId("suffix")).toBeTruthy();
  });

  test("allowClear clears uncontrolled value and calls onChange", () => {
    let nextValue: string | undefined;

    render(
      <Input
        allowClear
        defaultValue="clear me"
        onChange={(event) => {
          nextValue = event.currentTarget.value;
        }}
      />,
    );

    const input = screen.getByDisplayValue("clear me") as HTMLInputElement;

    fireEvent.click(screen.getByRole("button", { name: "Clear input" }));

    expect(input.value).toBe("");
    expect(nextValue).toBe("");
  });

  test("Search calls onSearch from enter key and enter button", () => {
    const searches: Array<{ value: string; eventType: string | undefined }> =
      [];

    render(
      <Input.Search
        enterButton
        defaultValue="query"
        onSearch={(value, event) => {
          searches.push({ value, eventType: event?.type });
        }}
      />,
    );

    const input = screen.getByDisplayValue("query");

    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(searches).toEqual([
      { value: "query", eventType: "keydown" },
      { value: "query", eventType: "click" },
    ]);
  });

  test("Password renders as password and toggles visibility", () => {
    render(<Input.Password placeholder="Password" />);

    const input = screen.getByPlaceholderText("Password") as HTMLInputElement;

    expect(input.type).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });

  test("TextArea renders class props and showCount", () => {
    render(
      <Input.TextArea
        defaultValue="hello"
        maxLength={10}
        placeholder="Notes"
        resize="none"
        showCount
        size="lg"
        status="success"
        variant="filled"
      />,
    );

    const textarea = screen.getByPlaceholderText("Notes");

    expect(textarea.className).toContain("textarea");
    expect(textarea.className).toContain("textarea-filled");
    expect(textarea.className).toContain("textarea-lg");
    expect(textarea.className).toContain("textarea-success");
    expect(textarea.className).toContain("textarea-resize-none");
    expect(screen.getByText("5 / 10").className).toContain("textarea-counter");
  });

  test("TextArea updates showCount for uncontrolled changes", () => {
    render(<Input.TextArea defaultValue="a" showCount />);

    fireEvent.change(screen.getByDisplayValue("a"), {
      target: { value: "abcd" },
    });

    expect(screen.getByText("4")).toBeTruthy();
  });

  test("Group wraps children with input-group", () => {
    render(
      <Input.Group className="custom-group" data-testid="group">
        <Input placeholder="First" />
        <Input placeholder="Second" />
      </Input.Group>,
    );

    const group = screen.getByTestId("group");

    expect(group.className).toContain("input-group");
    expect(group.className).toContain("custom-group");
    expect(screen.getByPlaceholderText("First")).toBeTruthy();
    expect(screen.getByPlaceholderText("Second")).toBeTruthy();
  });
});
