import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmTree } from "./DmTree";

const treeData = [
  {
    key: "root",
    title: "Root",
    id: "root",
    name: "Root",
    children: [
      { key: "alpha", title: "Alpha", id: "alpha", name: "Alpha" },
      { key: "beta", title: "Beta", id: "beta", name: "Beta" },
    ],
  },
  { key: "leaf", title: "Leaf", id: "leaf", name: "Leaf" },
];

describe("DmTree", () => {
  test("normalizes fieldNames and emits Dm onChange payload", () => {
    const changes: Array<unknown[]> = [];

    render(
      <DmTree
        treeData={[...treeData]}
        selectedKey="alpha"
        fieldNames={{ key: "id", title: "name", children: "children" }}
        onChange={(item, key, before) => changes.push([item?.name, key, before])}
      />,
    );

    expect(screen.getByText("Root")).toBeTruthy();
    expect(screen.getByText("Alpha")).toBeTruthy();

    fireEvent.click(screen.getByText("Leaf"));

    expect(changes).toEqual([["Leaf", "leaf", "alpha"]]);
  });

  test("supports search, all item, and item toolbar actions", () => {
    const changes: Array<unknown[]> = [];
    const actions: string[] = [];

    render(
      <DmTree
        treeData={[...treeData]}
        fieldNames={{ key: "id", title: "name", children: "children" }}
        showSearch
        allItem={{ value: "all", label: "Everything" }}
        itemToolbar={[{ icon: "Edit", title: "Edit item", onClick: (item) => actions.push(String(item.name)) }]}
        onChange={(item, key, before) => changes.push([item?.name, key, before])}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Leaf" },
    });

    expect(screen.getByText("Leaf")).toBeTruthy();
    expect(screen.queryByText("Alpha")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Everything" }));
    expect(changes.at(-1)).toEqual([undefined, "all", undefined]);

    fireEvent.click(screen.getByRole("button", { name: "Edit item" }));
    expect(actions).toEqual(["Leaf"]);
  });

  test("renders top toolbar, loading, empty, and option tree variants", () => {
    const { rerender, container } = render(
      <DmTree
        treeData={[]}
        loading
        customTopToolbar={<button>Custom</button>}
      />,
    );

    expect(screen.getByText("Custom")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();

    rerender(<DmTree treeData={[]} emptyNode={<span>No nodes</span>} />);
    expect(screen.getByText("No nodes")).toBeTruthy();

    rerender(
      <DmTree
        isTabTree
        items={[
          {
            key: "one",
            label: "One",
            TreeSetting: {
              treeData: [{ key: "item", title: "Item" }],
              showAll: false,
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("One")).toBeTruthy();
    expect(container.querySelector(".dm-tree-option")).toBeTruthy();
  });
});
