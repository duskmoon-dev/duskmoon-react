import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmTable, filterDmTableColumn } from "./DmTable";

const columns = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Hidden", dataIndex: "hidden", key: "hidden", hideInTable: true },
  {
    title: "Search only",
    dataIndex: "query",
    key: "query",
    onlySearch: true,
    search: { type: "input" as const, extraProps: {}, formProps: {} },
  },
];
const dataSource = [
  { id: 1, name: "Alpha", hidden: "H" },
  { id: 2, name: "Beta", hidden: "H" },
];

describe("DmTable", () => {
  test("filters table/search columns and renders table content", () => {
    render(
      <DmTable
        name="Users"
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        columnSettingVisible={false}
      />,
    );

    expect(screen.getByText("Users")).toBeTruthy();
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.queryByText("Hidden")).toBeNull();
    expect(screen.getByText("Search only")).toBeTruthy();
  });

  test("renders extra, column settings, and pagination wrapper", () => {
    render(
      <DmTable
        columns={columns.slice(0, 2)}
        dataSource={dataSource}
        rowKey="id"
        extra={<button>New</button>}
        pagination={{ total: 2, current: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText("New")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));
    expect(screen.getByRole("dialog", { name: "Column settings" })).toBeTruthy();
    expect(document.querySelector(".dm-table-pagination")).toBeTruthy();
  });

  test("exports table column filter helper", () => {
    expect(filterDmTableColumn(columns[2])).toBe(false);
  });
});
