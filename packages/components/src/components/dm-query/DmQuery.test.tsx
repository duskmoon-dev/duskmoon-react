import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
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
});
