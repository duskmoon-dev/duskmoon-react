import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Radio } from "./Radio";

describe("Radio", () => {
  test("renders with default classes", () => {
    render(<Radio name="choice">Choice</Radio>);
    const radio = screen.getByRole("radio");
    const wrapper = radio.closest("label") as HTMLElement;
    const circle = wrapper.querySelector(".radio-circle") as HTMLElement;

    expect(wrapper.className).toContain("radio");
    expect(circle.className).toContain("radio-circle");
    expect(circle.className).toContain("radio-primary");
    expect(screen.getByText("Choice").className).toContain("radio-label");
  });

  test("supports checked state", () => {
    render(
      <Radio checked readOnly>
        Selected
      </Radio>,
    );
    const radio = screen.getByRole("radio") as HTMLInputElement;

    expect(radio.checked).toBe(true);
  });

  test("calls native change handler", () => {
    let checked = false;
    render(<Radio onChange={(event) => (checked = event.target.checked)} />);
    const radio = screen.getByRole("radio");

    fireEvent.click(radio);

    expect(checked).toBe(true);
  });

  test("applies size, color, error, loading, and label position classes", () => {
    render(
      <Radio color="tertiary" size="sm" error loading labelPosition="left">
        Disabled
      </Radio>,
    );
    const radio = screen.getByRole("radio") as HTMLInputElement;
    const wrapper = radio.closest("label") as HTMLElement;
    const circle = wrapper.querySelector(".radio-circle") as HTMLElement;

    expect(radio.disabled).toBe(true);
    expect(wrapper.className).toContain("radio-sm");
    expect(wrapper.className).toContain("radio-error");
    expect(wrapper.className).toContain("radio-loading");
    expect(circle.className).toContain("radio-tertiary");
    expect(screen.getByText("Disabled").className).toContain(
      "radio-label-left",
    );
  });

  test("forwards input ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio ref={ref} />);

    expect(ref.current?.tagName).toBe("INPUT");
  });
});
