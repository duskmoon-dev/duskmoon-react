import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Swap } from "./Swap";

describe("Swap", () => {
  test("uses one native checkbox as the form state source", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form aria-label="Preferences">
        <Swap
          aria-label="Use dark appearance"
          name="dark"
          defaultChecked
          rotate
          off={<span>Light</span>}
          on={<span>Dark</span>}
          ref={ref}
        />
      </form>,
    );
    const checkbox = screen.getByRole("checkbox", {
      name: "Use dark appearance",
    }) as HTMLInputElement;

    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(checkbox.checked).toBe(true);
    expect(ref.current).toBe(checkbox);
    expect(checkbox.className).toContain("swap-input");
    expect(checkbox.closest("label")?.className).toContain("swap-rotate");
    expect(
      container.querySelectorAll(".swap > .swap-off[aria-hidden='true']"),
    ).toHaveLength(1);
    expect(
      container.querySelectorAll(".swap > .swap-on[aria-hidden='true']"),
    ).toHaveLength(1);
    expect(
      new FormData(
        screen.getByRole("form", { name: "Preferences" }) as HTMLFormElement,
      ).get("dark"),
    ).toBe("on");
  });

  test("reports native uncontrolled and controlled checkbox changes", () => {
    const observed: boolean[] = [];
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      observed.push(event.currentTarget.checked);
    };
    const { rerender } = render(
      <Swap aria-label="Toggle state" defaultChecked={false} />,
    );
    const checkbox = screen.getByRole("checkbox", {
      name: "Toggle state",
    }) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);

    rerender(
      <Swap
        aria-label="Controlled state"
        checked={false}
        onChange={onChange}
      />,
    );
    const controlled = screen.getByRole("checkbox", {
      name: "Controlled state",
    }) as HTMLInputElement;

    fireEvent.click(controlled);
    expect(observed).toEqual([true]);
    expect(controlled.checked).toBe(false);
  });

  test("native form reset restores default state and disabled blocks activation", () => {
    const onChange = () => {
      throw new Error("disabled Swap must not change");
    };
    render(
      <form aria-label="Swap form">
        <Swap aria-label="Enabled toggle" name="enabled" defaultChecked />
        <Swap aria-label="Disabled toggle" disabled onChange={onChange} />
      </form>,
    );
    const form = screen.getByRole("form", {
      name: "Swap form",
    }) as HTMLFormElement;
    const enabled = screen.getByRole("checkbox", {
      name: "Enabled toggle",
    }) as HTMLInputElement;
    const disabled = screen.getByRole("checkbox", {
      name: "Disabled toggle",
    }) as HTMLInputElement;

    fireEvent.click(enabled);
    expect(enabled.checked).toBe(false);
    form.reset();
    expect(enabled.checked).toBe(true);

    fireEvent.click(disabled);
    expect(disabled.checked).toBe(false);
  });
});
