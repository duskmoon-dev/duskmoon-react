import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { DmProTable } from "./DmProTable";

const columns = [{ title: "Name", dataIndex: "name", key: "name" }];

describe("DmProTable", () => {
  test("renders title bar, toolbar, and inner table rows", () => {
    render(
      <DmProTable
        headerTitle="Audit"
        toolBarRender={() => <button>Export</button>}
        columns={columns}
        rowData={[{ name: "Alpha" }]}
        columnSettingVisible
      />,
    );

    expect(screen.getByText("Audit")).toBeTruthy();
    expect(screen.getByText("Export")).toBeTruthy();
    expect(screen.getByText("Alpha")).toBeTruthy();
  });

  test("can hide title bar", () => {
    render(
      <DmProTable
        showTitleBar={false}
        headerTitle="Hidden"
        columns={columns}
        rowData={[]}
      />,
    );

    expect(screen.queryByText("Hidden")).toBeNull();
  });
});
