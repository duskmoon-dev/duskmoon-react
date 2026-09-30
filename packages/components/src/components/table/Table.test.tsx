import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Table } from "./Table";

interface UserRow {
  key: string;
  name: string;
  age: number;
  role: "admin" | "user";
  address?: {
    city: string;
  };
}

const dataSource: UserRow[] = [
  {
    key: "1",
    name: "Ada",
    age: 36,
    role: "admin",
    address: { city: "London" },
  },
  { key: "2", name: "Ben", age: 24, role: "user", address: { city: "Paris" } },
  { key: "3", name: "Cid", age: 42, role: "user", address: { city: "Rome" } },
];

describe("Table", () => {
  test("renders columns, dataSource, nested dataIndex, loading, and empty text", () => {
    const { container } = render(
      <>
        <Table<UserRow>
          dataSource={dataSource}
          columns={[
            { title: "Name", dataIndex: "name" },
            { title: "City", dataIndex: ["address", "city"] },
          ]}
          loading={{ spinning: true, indicator: "Working" }}
          bordered
          size="large"
        />
        <Table<UserRow>
          dataSource={[]}
          columns={[{ title: "Name", dataIndex: "name" }]}
          locale={{ emptyText: "Nothing here" }}
        />
      </>,
    );

    expect(container.querySelector(".table-wrapper")?.className).toContain(
      "table-loading",
    );
    expect(container.querySelector(".table")?.className).toContain(
      "table-bordered",
    );
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("London")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Working");
    expect(screen.getByText("Nothing here")).toBeTruthy();
  });

  test("sorts data and emits onChange sorter information", () => {
    const changes: string[] = [];

    render(
      <Table<UserRow>
        dataSource={dataSource}
        columns={[
          { title: "Name", dataIndex: "name" },
          {
            title: "Age",
            dataIndex: "age",
            sorter: (first, second) => first.age - second.age,
          },
        ]}
        pagination={false}
        onChange={(_pagination, _filters, sorter, extra) => {
          changes.push(`${sorter.columnKey}:${sorter.order}:${extra.action}`);
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort Age" }));

    const rows = screen.getAllByRole("row").map((row) => row.textContent ?? "");
    expect(rows[1]).toContain("Ben");
    expect(changes.at(-1)).toBe("age:ascend:sort");
  });

  test("filters rows and emits filter changes", () => {
    const filterChanges: Array<Record<string, unknown>> = [];

    render(
      <Table<UserRow>
        dataSource={dataSource}
        columns={[
          { title: "Name", dataIndex: "name" },
          {
            title: "Role",
            dataIndex: "role",
            filters: [
              { text: "Admins", value: "admin" },
              { text: "Users", value: "user" },
            ],
            filterMultiple: false,
            onFilter: (value, record) => record.role === value,
          },
        ]}
        pagination={false}
        onChange={(_pagination, filters) => filterChanges.push(filters)}
      />,
    );

    fireEvent.change(screen.getByLabelText("Filter Role"), {
      target: { value: "admin" },
    });

    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.queryByText("Ben")).toBeNull();
    expect(filterChanges.at(-1)).toEqual({ role: ["admin"] });
  });

  test("supports row selection and expandable rows", () => {
    const selected: string[][] = [];
    const expanded: string[][] = [];

    render(
      <Table<UserRow>
        dataSource={dataSource}
        columns={[{ title: "Name", dataIndex: "name" }]}
        pagination={false}
        rowSelection={{
          onChange: (keys) => selected.push(keys.map(String)),
        }}
        expandable={{
          expandedRowRender: (record) => <span>Details for {record.name}</span>,
          onExpandedRowsChange: (keys) => expanded.push(keys.map(String)),
        }}
      />,
    );

    fireEvent.click(screen.getByLabelText("Select row 1"));
    fireEvent.click(screen.getByRole("button", { name: "Expand row 1" }));

    expect(selected.at(-1)).toEqual(["1"]);
    expect(expanded.at(-1)).toEqual(["1"]);
    expect(screen.getByText("Details for Ada")).toBeTruthy();
  });

  test("supports pagination config, summary, Column, and ColumnGroup", () => {
    const pageChanges: string[] = [];

    render(
      <Table<UserRow>
        dataSource={dataSource}
        pagination={{
          defaultPageSize: 2,
          onChange: (page) => pageChanges.push(String(page)),
        }}
        summary={(rows) => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={2}>
                Rows: {rows.length}
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      >
        <Table.ColumnGroup title="Profile">
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column
            title="Age"
            dataIndex="age"
            render={(value) => <strong>{String(value)}</strong>}
          />
        </Table.ColumnGroup>
      </Table>,
    );

    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByText("Rows: 2")).toBeTruthy();
    expect(screen.queryByText("Cid")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(pageChanges.at(-1)).toBe("2");
    expect(screen.getByText("Cid")).toBeTruthy();
  });
});
