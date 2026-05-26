import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { DmProTableInner } from "./DmProTableInner";

describe("DmProTableInner", () => {
  test("adapts rowData to the local DmTable dataSource", () => {
    render(
      <DmProTableInner
        columns={[{ title: "Name", dataIndex: "name", key: "name" }]}
        rowData={[{ name: "Alpha" }]}
      />,
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
  });
});
