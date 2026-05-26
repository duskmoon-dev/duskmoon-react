import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  test("renders with default classes", () => {
    render(<Checkbox>Accept</Checkbox>);
    const checkbox = screen.getByRole("checkbox");
    const wrapper = checkbox.closest("label") as HTMLElement;
    const box = wrapper.querySelector(".checkbox-box") as HTMLElement;

    expect(wrapper.className).toContain("checkbox");
    expect(box.className).toContain("checkbox-box");
    expect(box.className).toContain("checkbox-primary");
    expect(screen.getByText("Accept").className).toContain("checkbox-label");
  });

  test("applies checked and indeterminate state", () => {
    render(
      <Checkbox checked indeterminate readOnly>
        Mixed
      </Checkbox>,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.getAttribute("aria-checked")).toBe("mixed");
  });

  test("calls native change handler", () => {
    let checked = false;
    render(<Checkbox onChange={(event) => (checked = event.target.checked)} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(checked).toBe(true);
  });

  test("applies size, color, error, loading, and label position classes", () => {
    render(
      <Checkbox color="secondary" size="lg" error loading labelPosition="left">
        Disabled
      </Checkbox>,
    );
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    const wrapper = checkbox.closest("label") as HTMLElement;
    const box = wrapper.querySelector(".checkbox-box") as HTMLElement;

    expect(checkbox.disabled).toBe(true);
    expect(wrapper.className).toContain("checkbox-lg");
    expect(wrapper.className).toContain("checkbox-error");
    expect(wrapper.className).toContain("checkbox-loading");
    expect(box.className).toContain("checkbox-secondary");
    expect(screen.getByText("Disabled").className).toContain(
      "checkbox-label-left",
    );
  });

  test("forwards input ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);

    expect(ref.current?.tagName).toBe("INPUT");
  });
});
