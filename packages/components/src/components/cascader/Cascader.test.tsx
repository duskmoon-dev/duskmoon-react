import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Cascader } from "./Cascader";
import type { CascaderOption } from "./Cascader.types";

const options: CascaderOption[] = [
  {
    label: "Zhejiang",
    value: "zhejiang",
    children: [
      {
        label: "Hangzhou",
        value: "hangzhou",
        children: [{ label: "West Lake", value: "west-lake" }],
      },
    ],
  },
  {
    label: "Jiangsu",
    value: "jiangsu",
    children: [{ label: "Nanjing", value: "nanjing" }],
  },
];

describe("Cascader", () => {
  test("renders a default value and selects a leaf path", () => {
    const changes: unknown[] = [];

    render(
      <Cascader
        options={options}
        defaultOpen
        defaultValue={["zhejiang", "hangzhou", "west-lake"]}
        onChange={(value) => changes.push(value)}
      />,
    );

    expect(screen.getByText("Zhejiang")).toBeTruthy();
    expect(screen.getByText("Hangzhou")).toBeTruthy();
    expect(screen.getByText("West Lake")).toBeTruthy();

    fireEvent.click(screen.getByRole("menuitem", { name: /Jiangsu/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Nanjing/ }));

    expect(changes.at(-1)).toEqual(["jiangsu", "nanjing"]);
  });

  test("supports controlled open callbacks and allowClear", () => {
    const visibleChanges: boolean[] = [];
    const changes: unknown[] = [];

    render(
      <Cascader
        options={options}
        defaultValue={["jiangsu", "nanjing"]}
        allowClear
        onOpenChange={(open) => visibleChanges.push(open)}
        onDropdownVisibleChange={(open) => visibleChanges.push(open)}
        onChange={(value) => changes.push(value)}
      />,
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(visibleChanges).toEqual([true, true]);

    fireEvent.click(screen.getByLabelText("Clear selection"));
    expect(changes.at(-1)).toEqual([]);
  });

  test("supports multiple selection and onSelect", () => {
    const changes: unknown[] = [];
    const selections: unknown[] = [];

    render(
      <Cascader
        multiple
        defaultOpen
        options={options}
        onChange={(value) => changes.push(value)}
        onSelect={(value) => selections.push(value)}
      />,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: /Zhejiang/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Hangzhou/ }));

    expect(selections.at(-1)).toEqual(["zhejiang", "hangzhou"]);
    expect(changes.at(-1)).toEqual([
      ["zhejiang"],
      ["zhejiang", "hangzhou"],
    ]);
  });

  test("supports search, displayRender, and fieldNames", () => {
    const customOptions: CascaderOption[] = [
      {
        name: "Asia",
        code: "asia",
        nodes: [{ name: "Shanghai", code: "shanghai" }],
      },
    ];
    const searches: string[] = [];

    render(
      <Cascader
        defaultOpen
        showSearch
        options={customOptions}
        fieldNames={{ label: "name", value: "code", children: "nodes" }}
        displayRender={(labels) => labels.join(" > ")}
        onSearch={(value) => searches.push(value)}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Please select"), {
      target: { value: "shang" },
    });
    fireEvent.click(screen.getByRole("menuitem", { name: /Asia/ }));

    expect(searches).toEqual(["shang"]);
    expect(screen.getByText("Asia > Shanghai")).toBeTruthy();
  });

  test("supports loadData markers, disabled state, constants, and Panel", () => {
    const loads: unknown[] = [];
    const lazyOptions: CascaderOption[] = [
      { label: "Lazy", value: "lazy", isLeaf: false },
    ];
    const { container } = render(
      <>
        <Cascader defaultOpen options={lazyOptions} loadData={(path) => loads.push(path)} />
        <Cascader disabled options={options} />
        <Cascader.Panel options={options} defaultValue={["zhejiang"]} />
      </>,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: /Lazy/ }));
    fireEvent.click(screen.getAllByRole("button")[1]);

    expect(loads).toHaveLength(1);
    expect(screen.getAllByText("Zhejiang").length).toBeGreaterThan(0);
    expect(container.querySelector(".cascader-disabled")).toBeTruthy();
    expect(Cascader.SHOW_PARENT).toBe("SHOW_PARENT");
    expect(Cascader.SHOW_CHILD).toBe("SHOW_CHILD");
  });
});
