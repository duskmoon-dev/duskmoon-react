import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Segmented } from "./Segmented";

describe("Segmented", () => {
  test("renders string options with DuskMoon segmented classes", () => {
    const { container } = render(
      <Segmented options={["Day", "Week", "Month"]} />,
    );

    expect(container.querySelector(".toggle-group")).toBeTruthy();
    expect(container.querySelector(".toggle-segmented")).toBeTruthy();
    expect(screen.getByText("Day")).toBeTruthy();
    expect(screen.getByText("Week")).toBeTruthy();
    expect(screen.getByText("Month")).toBeTruthy();
  });

  test("supports object options and default selection", () => {
    render(
      <Segmented
        defaultValue="week"
        options={[
          { label: "Day", value: "day" },
          { label: "Week", value: "week" },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "Week" }).className).toContain(
      "toggle-btn-active",
    );
  });

  test("calls onChange with selected value", () => {
    let nextValue: string | number | undefined;
    render(
      <Segmented
        options={["A", "B"]}
        onChange={(selectedValue) => {
          nextValue = selectedValue;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "B" }));

    expect(nextValue).toBe("B");
  });

  test("supports className, block, size, and disabled", () => {
    const { container } = render(
      <Segmented
        className="custom-segmented"
        block
        size="lg"
        disabled
        options={["A", "B"]}
      />,
    );

    expect(container.querySelector(".custom-segmented")).toBeTruthy();
    expect(container.querySelector(".toggle-group-full")).toBeTruthy();
    expect(container.querySelector(".toggle-btn-lg")).toBeTruthy();
    expect(
      (screen.getByRole("radio", { name: "A" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Segmented ref={ref} options={["A"]} />);

    expect(ref.current?.className).toContain("toggle-group");
  });
});
