import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { List } from "./List";

describe("List", () => {
  test("renders dataSource with renderItem", () => {
    render(
      <List
        dataSource={["Item one", "Item two", "Item three"]}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />,
    );

    expect(screen.getByText("Item one")).toBeTruthy();
    expect(screen.getByText("Item two")).toBeTruthy();
    expect(screen.getByText("Item three")).toBeTruthy();
  });

  test("supports className and children", () => {
    const { container } = render(
      <List className="custom-list">
        <List.Item>Child item</List.Item>
      </List>,
    );

    expect(container.querySelector(".custom-list")).toBeTruthy();
    expect(screen.getByText("Child item")).toBeTruthy();
  });

  test("renders List.Item", () => {
    render(
      <List
        dataSource={["Test item"]}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />,
    );

    expect(screen.getByText("Test item")).toBeTruthy();
  });

  test("renders List.Item.Meta title and description", () => {
    render(
      <List>
        <List.Item>
          <List.Item.Meta title="Title" description="Description" />
        </List.Item>
      </List>,
    );

    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
  });

  test("renders actions, extra, and meta avatar", () => {
    const { container } = render(
      <List>
        <List.Item actions={[<button key="edit">Edit</button>]} extra="Extra">
          <List.Item.Meta avatar={<span>Avatar</span>} title="Meta title" />
        </List.Item>
      </List>,
    );

    expect(screen.getByText("Avatar")).toBeTruthy();
    expect(screen.getByText("Meta title")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Extra")).toBeTruthy();
    expect(container.querySelector(".list-item-leading")).toBeTruthy();
    expect(container.querySelector(".list-item-trailing")).toBeTruthy();
  });

  test("applies bordered and size classes", () => {
    const { container, rerender } = render(<List bordered size="sm" />);
    const list = container.firstChild as HTMLElement;

    expect(list.className).toContain("list");
    expect(list.className).toContain("list-bordered");
    expect(list.className).toContain("list-compact");

    rerender(<List size="lg" />);

    expect((container.firstChild as HTMLElement).className).toContain(
      "list-comfortable",
    );
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<List ref={ref} />);

    expect(ref.current?.className).toContain("list");
  });
});
