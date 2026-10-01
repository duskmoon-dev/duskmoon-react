import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { OtpInput } from "./OtpInput";

describe("OtpInput", () => {
  test("submits one native value and exposes a single input ref", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form aria-label="Verification">
        <OtpInput
          aria-label="Verification code"
          name="code"
          length={4}
          defaultValue="0012"
          ref={ref}
        />
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Verification code" });
    const form = screen.getByRole("form", { name: "Verification" });
    const slots = container.querySelectorAll(".otp-input > span");

    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(slots).toHaveLength(4);
    expect(Array.from(slots).every((slot) => slot.textContent === "")).toBe(
      true,
    );
    expect(
      Array.from(slots).every(
        (slot) => slot.getAttribute("aria-hidden") === "true",
      ),
    ).toBe(true);
    expect(input).toBe(ref.current);
    expect(new FormData(form as HTMLFormElement).getAll("code")).toEqual([
      "0012",
    ]);
  });

  test("uses native constraints by default and allows native overrides", () => {
    const { rerender } = render(
      <OtpInput aria-label="Code" name="code" length={4} required />,
    );
    const input = screen.getByRole("textbox", {
      name: "Code",
    }) as HTMLInputElement;

    expect(input.required).toBe(true);
    expect(input.minLength).toBe(4);
    expect(input.maxLength).toBe(4);
    expect(input.pattern).toBe("[0-9]{4}");
    expect(input.inputMode).toBe("numeric");
    expect(input.autocomplete).toBe("one-time-code");

    rerender(
      <OtpInput
        aria-label="Custom code"
        length={8}
        minLength={2}
        maxLength={8}
        pattern="[A-Z]{2,8}"
        inputMode="text"
      />,
    );
    const customInput = screen.getByRole("textbox", {
      name: "Custom code",
    }) as HTMLInputElement;

    expect(customInput.minLength).toBe(2);
    expect(customInput.maxLength).toBe(8);
    expect(customInput.pattern).toBe("[A-Z]{2,8}");
    expect(customInput.inputMode).toBe("text");
  });

  test("keeps uncontrolled reset and controlled change behavior native", () => {
    const observed: string[] = [];
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      observed.push(event.currentTarget.value);
    };
    const { rerender } = render(
      <form aria-label="Code form">
        <OtpInput aria-label="Code" name="code" defaultValue="0012" />
      </form>,
    );
    const form = screen.getByRole("form", {
      name: "Code form",
    }) as HTMLFormElement;
    const input = screen.getByRole("textbox", {
      name: "Code",
    }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "1234" } });
    expect(input.value).toBe("1234");
    form.reset();
    expect(input.value).toBe("0012");

    rerender(
      <OtpInput
        aria-label="Controlled code"
        value="0000"
        onChange={onChange}
      />,
    );
    const controlled = screen.getByRole("textbox", {
      name: "Controlled code",
    }) as HTMLInputElement;

    fireEvent.change(controlled, { target: { value: "1234" } });
    expect(observed).toEqual(["1234"]);
    expect(controlled.value).toBe("0000");
  });
});
