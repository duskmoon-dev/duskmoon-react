import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { TreeSelect } from "./TreeSelect";
import type { TreeSelectDataNode } from "./TreeSelect.types";

const treeData: TreeSelectDataNode[] = [
  {
    title: "Root",
    value: "root",
    children: [
      { title: "Child A", value: "child-a" },
      { title: "Child B", value: "child-b", disabled: true },
    ],
  },
  { title: "Leaf", value: "leaf" },
];

describe("TreeSelect", () => {
  test("renders treeData and selects a single value", () => {
    const changes: unknown[] = [];

    render(
      <TreeSelect
        defaultOpen
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        onChange={(value) => changes.push(value)}
      />,
    );

    expect(screen.getByText("Child A")).toBeTruthy();

    fireEvent.click(screen.getByRole("treeitem", { name: "Child A" }));

    expect(changes.at(-1)).toBe("child-a");
    expect(screen.getByText("Child A")).toBeTruthy();
  });

  test("supports multiple treeCheckable selection and allowClear", () => {
    const changes: unknown[] = [];

    render(
      <TreeSelect
        defaultOpen
        allowClear
        treeCheckable
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        onChange={(value) => changes.push(value)}
      />,
    );

    fireEvent.click(screen.getByLabelText("Check Root"));

    expect(changes.at(-1)).toEqual(["root", "child-a", "child-b"]);

    fireEvent.click(screen.getByLabelText("Clear selection"));

    expect(changes.at(-1)).toEqual([]);
  });

  test("supports controlled value, search, filtering, and callbacks", () => {
    const searches: string[] = [];
    const selections: unknown[] = [];
    const visible: boolean[] = [];

    render(
      <TreeSelect
        open
        showSearch
        value={["leaf"]}
        multiple
        treeData={treeData}
        onSearch={(value) => searches.push(value)}
        onSelect={(value) => selections.push(value)}
        onDropdownVisibleChange={(open) => visible.push(open)}
      />,
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.change(screen.getByPlaceholderText("Please select"), {
      target: { value: "leaf" },
    });
    fireEvent.click(screen.getByRole("treeitem", { name: "Leaf" }));

    expect(searches).toEqual(["leaf"]);
    expect(selections).toEqual(["leaf"]);
    expect(visible).toEqual([false]);
    expect(screen.queryByText("Root")).toBeNull();
  });

  test("supports expansion control and loadData", () => {
    const loads: string[] = [];

    render(
      <TreeSelect
        defaultOpen
        treeData={[{ title: "Async", value: "async", isLeaf: false }]}
        loadData={(node) => loads.push(String(node.value))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand Async" }));

    expect(loads).toEqual(["async"]);
  });

  test("exposes TreeNode and checked strategy constants", () => {
    render(
      <TreeSelect defaultOpen>
        <TreeSelect.TreeNode title="Parent" value="parent">
          <TreeSelect.TreeNode title="Nested" value="nested" />
        </TreeSelect.TreeNode>
      </TreeSelect>,
    );

    expect(screen.getByText("Parent")).toBeTruthy();
    expect(TreeSelect.SHOW_ALL).toBe("SHOW_ALL");
    expect(TreeSelect.SHOW_PARENT).toBe("SHOW_PARENT");
    expect(TreeSelect.SHOW_CHILD).toBe("SHOW_CHILD");
  });
});
