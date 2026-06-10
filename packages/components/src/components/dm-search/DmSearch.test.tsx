import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DmSearch } from "./DmSearch";
import type { DmSearchRef } from "./DmSearch.types";

const items = [
  {
    key: "name",
    title: "Name",
    dataIndex: "name",
    search: { type: "input" as const, extraProps: {}, formProps: {} },
  },
  {
    key: "state",
    title: "State",
    dataIndex: "state",
    search: {
      type: "select" as const,
      extraProps: { options: [{ label: "Enabled", value: "enabled" }] },
      formProps: {},
    },
  },
];

describe("DmSearch", () => {
  test("submits values and toggles collapsed fields", () => {
    const searches: Array<Record<string, unknown>> = [];
    render(<DmSearch items={items} onSearch={(values) => searches.push(values)} />);

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.queryByText("State")).toBeNull();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "demo" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searches.at(-1)).toMatchObject({ name: "demo" });

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByText("State")).toBeTruthy();
  });

  test("honors searchParams and imperative reset", () => {
    const ref = createRef<DmSearchRef>();
    render(<DmSearch ref={ref} items={items} searchParams={{ name: "from-url" }} />);

    expect(screen.getByDisplayValue("from-url")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "changed" } });
    act(() => {
      ref.current?.onReset();
    });
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  });
});
