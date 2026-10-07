import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DmQuery } from "./DmQuery";
import type { DmQueryItem } from "./DmQuery.types";
import type { DmQueryRef } from "./DmQuery.types";

const queryItem: DmQueryItem[] = [
  { key: "name", label: "Name", name: "name", type: "input" },
  { key: "state", label: "State", name: "state", type: "input" },
];

describe("DmQuery", () => {
  test("maps queryItem to Dm search items and exposes retractChange", () => {
    const ref = createRef<DmQueryRef>();
    render(<DmQuery ref={ref} queryItem={queryItem} />);

    expect(screen.getByText("Name")).toBeTruthy();
    act(() => {
      ref.current?.retractChange("state", queryItem);
    });
    expect(screen.getByText("State")).toBeTruthy();
  });

  test("forwards controlled custom fields, visible reset, and explicit expanded default", () => {
    const searches: unknown[] = [];
    const resets: unknown[] = [];
    const changes: unknown[] = [];
    const customItems: DmQueryItem[] = [
      {
        key: "score",
        name: "score",
        label: "Score",
        type: "custom",
        customProps: { initialValue: 0 },
        render: (value, setValue) => (
          <label>
            Typed score
            <input
              value={String(value ?? "")}
              onChange={(event) => setValue(Number(event.currentTarget.value))}
            />
          </label>
        ),
      },
      {
        key: "name",
        name: "name",
        label: "Name",
        type: "input",
        customProps: { initialValue: "" },
      },
    ];
    const { container } = render(
      <DmQuery
        queryItem={customItems}
        collapsed
        defaultCollapsed={false}
        hideCollapseBtn
        values={{ score: 0, name: "Ada" }}
        onValuesChange={(next) => changes.push(next)}
        onReset={(next) => resets.push(next)}
        onSearch={(next) => searches.push(next)}
      />,
    );
    expect(screen.getByDisplayValue("Ada")).toBeTruthy();
    expect(container.querySelector("label label")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Typed score" }), {
      target: { value: "2" },
    });
    expect(changes).toEqual([{ score: 2, name: "Ada" }]);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(searches).toEqual([{ score: 0, name: "Ada" }]);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(resets).toEqual([{ score: 0, name: "" }]);
    expect(searches).toHaveLength(1);
  });

  test("inherits noValidate for query form schema validation", () => {
    const { container } = render(<DmQuery noValidate queryItem={queryItem} />);
    expect(container.querySelector("form")?.noValidate).toBe(true);
  });
});
