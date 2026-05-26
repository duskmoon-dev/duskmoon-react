import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Transfer } from "./Transfer";

const dataSource = [
  { key: "1", title: "Alpha", description: "First item" },
  { key: "2", title: "Beta", description: "Second item" },
  { key: "3", title: "Gamma", disabled: true },
];

describe("Transfer", () => {
  test("renders source and target lists with titles", () => {
    const { container } = render(
      <Transfer dataSource={dataSource} targetKeys={["2"]} titles={["Left", "Right"]} />,
    );

    const root = container.querySelector(".transfer") as HTMLElement;

    expect(root).toBeTruthy();
    expect(screen.getByText("Left")).toBeTruthy();
    expect(screen.getByText("Right")).toBeTruthy();
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
  });

  test("moves selected source items to target", () => {
    const changes: Array<{ keys: string[]; direction: string; moved: string[] }> = [];

    render(
      <Transfer
        dataSource={dataSource}
        onChange={(keys, direction, moved) =>
          changes.push({ keys, direction, moved })
        }
      />,
    );

    fireEvent.click(screen.getByLabelText("Alpha"));
    fireEvent.click(screen.getByRole("button", { name: "Move selected items to target" }));

    expect(changes).toEqual([{ keys: ["1"], direction: "right", moved: ["1"] }]);
  });

  test("supports selectedKeys and select change callbacks", () => {
    const selections: Array<[string[], string[]]> = [];

    render(
      <Transfer
        dataSource={dataSource}
        targetKeys={["2"]}
        selectedKeys={["2"]}
        onSelectChange={(source, target) => selections.push([source, target])}
      />,
    );

    fireEvent.click(screen.getByLabelText("Alpha"));

    expect(selections.at(-1)).toEqual([["1"], ["2"]]);
  });

  test("supports search, render object, filter, and pagination", () => {
    const searches: string[] = [];

    render(
      <Transfer
        dataSource={dataSource}
        showSearch
        pagination={{ pageSize: 1 }}
        render={(item) => ({ label: <span>{item.title}</span>, value: String(item.title) })}
        filterOption={(input, item) => String(item.title).toLowerCase().includes(input)}
        onSearch={(direction, value) => searches.push(`${direction}:${value}`)}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search left list" }), {
      target: { value: "bet" },
    });

    expect(searches.at(-1)).toBe("left:bet");
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.getByText("Beta")).toBeTruthy();
  });

  test("supports oneWay, disabled state, rowKey, and subcomponents", () => {
    const { container } = render(
      <>
        <Transfer
          dataSource={[{ id: "a", title: "Row keyed" } as { id: string; title: string; key: string }]}
          rowKey={(item) => item.id}
          defaultTargetKeys={["a"]}
          defaultSelectedKeys={["a"]}
          oneWay
          disabled
        />
        <Transfer.Search aria-label="Standalone search" onChange={() => undefined} />
        <Transfer.Operation oneWay />
      </>,
    );

    expect(container.querySelector(".transfer")?.className).toContain(
      "transfer-disabled",
    );
    expect(
      screen.queryByRole("button", { name: "Move selected items to source" }),
    ).toBeNull();
    expect(screen.getByRole("searchbox", { name: "Standalone search" })).toBeTruthy();
  });
});
