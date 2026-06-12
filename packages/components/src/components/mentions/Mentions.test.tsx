import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Mentions } from "./Mentions";
import type { MentionsOptionType } from "./Mentions.types";

describe("Mentions", () => {
  test("renders textarea, classes, placement, and filtered options", () => {
    const { container } = render(
      <Mentions
        className="custom-mentions"
        placement="top"
        options={[
          { value: "alice", label: "Alice" },
          { value: "bob", label: "Bob" },
        ]}
      />,
    );

    const root = container.querySelector(".mentions") as HTMLElement;
    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "@al" } });

    expect(root.className).toContain("custom-mentions");
    expect(root.className).toContain("mentions-placement-top");
    expect(textarea.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("listbox").className).toContain(
      "mentions-placement-top",
    );
    expect(screen.getByRole("option", { name: "Alice" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Bob" })).toBeNull();
  });

  test("supports search and select callbacks with insertion", () => {
    let changed = "";
    let searchText = "";
    let searchPrefix = "";
    let selectedOption: MentionsOptionType | undefined;
    let selectedPrefix = "";

    render(
      <Mentions
        options={[{ value: "alice", label: "Alice" }]}
        onChange={(value) => {
          changed = value;
        }}
        onSearch={(text, prefix) => {
          searchText = text;
          searchPrefix = prefix;
        }}
        onSelect={(option, prefix) => {
          selectedOption = option;
          selectedPrefix = prefix;
        }}
      />,
    );

    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "hello @al" } });
    fireEvent.click(screen.getByRole("option", { name: "Alice" }));

    expect(searchText).toBe("al");
    expect(searchPrefix).toBe("@");
    expect(changed).toBe("hello @alice ");
    expect(selectedOption?.value).toBe("alice");
    expect(selectedPrefix).toBe("@");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  test("supports controlled value and custom prefix and split", () => {
    let searched = "";
    let changed = "";

    render(
      <Mentions
        value="#al"
        prefix={["@", "#"]}
        split=","
        options={[{ value: "alpha", label: "Alpha" }]}
        onChange={(value) => {
          changed = value;
        }}
        onSearch={(text) => {
          searched = text;
        }}
      />,
    );

    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;

    fireEvent.click(textarea);
    fireEvent.click(screen.getByRole("option", { name: "Alpha" }));

    expect(searched).toBe("al");
    expect(changed).toBe("#alpha,");
    expect(textarea.value).toBe("#al");
  });

  test("supports Mentions.Option children and disabled options", () => {
    let selected = "";

    render(
      <Mentions
        defaultValue="@"
        onSelect={(option) => {
          selected = option.value;
        }}
      >
        <Mentions.Option value="enabled">Enabled</Mentions.Option>
        <Mentions.Option value="disabled" disabled>
          Disabled
        </Mentions.Option>
      </Mentions>,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const disabled = screen.getByRole("option", { name: "Disabled" });
    fireEvent.click(disabled);

    expect(disabled.getAttribute("aria-disabled")).toBe("true");
    expect(selected).toBe("");

    fireEvent.click(screen.getByRole("option", { name: "Enabled" }));

    expect(selected).toBe("enabled");
  });

  test("supports keyboard navigation and notFoundContent", () => {
    render(
      <Mentions
        notFoundContent="No users"
        options={[
          { value: "alice", label: "Alice" },
          { value: "bob", label: "Bob" },
        ]}
      />,
    );

    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: "@z" } });
    expect(screen.getByText("No users")).toBeTruthy();

    fireEvent.change(textarea, { target: { value: "@" } });
    fireEvent.keyDown(textarea, { key: "ArrowDown" });
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(textarea.value).toBe("@bob ");
  });

  test("supports disabled state", () => {
    render(
      <Mentions disabled options={[{ value: "alice", label: "Alice" }]} />,
    );

    const textarea = screen.getByRole("combobox") as HTMLTextAreaElement;

    expect(textarea.disabled).toBe(true);
    expect(textarea.getAttribute("aria-disabled")).toBe("true");

    fireEvent.change(textarea, { target: { value: "@al" } });

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
