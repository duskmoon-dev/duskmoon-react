import { expect, test, describe } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Collapse } from "./Collapse";

const items = [
  { key: "1", label: "Panel one", children: <p>Panel one content</p> },
  { key: "2", label: "Panel two", children: <p>Panel two content</p> },
];

describe("Collapse", () => {
  test("renders item labels with DuskMoon collapse classes", () => {
    const { container } = render(<Collapse items={items} />);

    expect(container.querySelector(".collapse-group")).toBeTruthy();
    expect(container.querySelectorAll(".collapse").length).toBe(2);
    expect(screen.getByText("Panel one")).toBeTruthy();
    expect(screen.getByText("Panel two")).toBeTruthy();
  });

  test("supports default active key", () => {
    render(<Collapse items={items} defaultActiveKey={["1"]} />);

    expect(screen.getByText("Panel one content")).toBeTruthy();
  });

  test("supports className and toggles panels", () => {
    const { container } = render(
      <Collapse className="custom-collapse" items={items} />,
    );

    expect(container.querySelector(".custom-collapse")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Panel two/ }));

    expect(screen.getByText("Panel two content")).toBeTruthy();
  });

  test("supports accordion onChange", () => {
    let nextKey: string | number | Array<string | number> | undefined;
    render(
      <Collapse
        accordion
        items={items}
        onChange={(key) => {
          nextKey = key;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Panel one/ }));

    expect(nextKey).toBe("1");
  });

  test("supports size, ghost, and disabled item classes", () => {
    const { container } = render(
      <Collapse
        ghost
        size="lg"
        items={[{ key: "1", label: "Disabled", disabled: true }]}
      />,
    );

    expect(container.querySelector(".collapse-lg")).toBeTruthy();
    expect(container.querySelector(".collapse-ghost")).toBeTruthy();
    expect(container.querySelector(".collapse-disabled")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: /Disabled/ }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Collapse ref={ref} items={items} />);

    expect(ref.current?.className).toContain("collapse-group");
  });
});
