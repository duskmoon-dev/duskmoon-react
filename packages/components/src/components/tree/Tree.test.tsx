import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tree } from "./Tree";

const treeData = [
  {
    key: "root",
    title: "Root",
    children: [
      { key: "child-a", title: "Child A" },
      { key: "child-b", title: "Child B", disabled: true },
    ],
  },
  { key: "leaf", title: "Leaf", icon: <span>icon</span> },
];

describe("Tree", () => {
  test("renders treeData and expands uncontrolled nodes", () => {
    render(<Tree treeData={treeData} />);

    expect(screen.getByText("Root")).toBeTruthy();
    expect(screen.queryByText("Child A")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand root" }));

    expect(screen.getByText("Child A")).toBeTruthy();
  });

  test("supports controlled expanded keys and loadData callback", () => {
    const expands: string[][] = [];
    const loaded: string[] = [];

    render(
      <Tree
        treeData={[{ key: "async", title: "Async", isLeaf: false }]}
        expandedKeys={[]}
        loadData={(node) => loaded.push(String(node.key))}
        onExpand={(keys) => expands.push(keys.map(String))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand async" }));

    expect(expands).toEqual([["async"]]);
    expect(loaded).toEqual(["async"]);
  });

  test("supports selected and checked key flows", () => {
    const selections: string[][] = [];
    const checks: string[][] = [];

    render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        checkable
        multiple
        onSelect={(keys) => selections.push(keys.map(String))}
        onCheck={(keys) => checks.push(keys.map(String))}
      />,
    );

    fireEvent.click(screen.getByText("Child A"));
    fireEvent.click(screen.getByLabelText("Check root"));

    expect(selections.at(-1)).toEqual(["child-a"]);
    expect(checks.at(-1)).toEqual(["root", "child-a", "child-b"]);
  });

  test("respects disabled, selectable, showLine, and showIcon markers", () => {
    const selections: string[][] = [];
    const { container } = render(
      <Tree
        treeData={treeData}
        defaultExpandedKeys={["root"]}
        defaultSelectedKeys={["leaf"]}
        selectable={false}
        showLine
        showIcon
        onSelect={(keys) => selections.push(keys.map(String))}
      />,
    );

    fireEvent.click(screen.getByText("Leaf"));

    expect(selections).toEqual([]);
    expect(container.querySelector(".tree-show-line")).toBeTruthy();
    expect(container.querySelector(".tree-node-selected")).toBeTruthy();
    expect(screen.getByText("icon")).toBeTruthy();
  });

  test("supports drag and drop callbacks", () => {
    const drops: Array<{ node: string; drag?: string; keys: string[] }> = [];

    render(
      <Tree
        treeData={treeData}
        draggable
        onDrop={(info) =>
          drops.push({
            node: String(info.node.key),
            drag: info.dragNode ? String(info.dragNode.key) : undefined,
            keys: info.dragNodesKeys.map(String),
          })
        }
      />,
    );

    fireEvent.dragStart(screen.getByText("Root"));
    fireEvent.drop(screen.getByText("Leaf"));

    expect(drops).toEqual([{ node: "leaf", drag: "root", keys: ["root"] }]);
  });

  test("exposes TreeNode and DirectoryTree subcomponents", () => {
    const { container } = render(
      <>
        <Tree.DirectoryTree
          treeData={[{ key: "dir", title: "Directory" }]}
          defaultSelectedKeys={["dir"]}
        />
        <Tree treeData={undefined}>
          <Tree.TreeNode title="Parent" eventKey="parent">
            <Tree.TreeNode title="Nested" eventKey="nested" />
          </Tree.TreeNode>
        </Tree>
      </>,
    );

    expect(screen.getByText("Directory")).toBeTruthy();
    expect(screen.getByText("Parent")).toBeTruthy();
    expect(container.querySelector(".tree-directory")).toBeTruthy();
  });
});
