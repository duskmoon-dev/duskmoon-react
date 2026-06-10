import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Empty } from "./Empty";

describe("Empty", () => {
  test("renders default empty state", () => {
    const { container } = render(<Empty />);
    const empty = container.firstChild as HTMLElement;

    expect(empty.className).toContain("empty");
    expect(empty.querySelector(".empty-image")).toBeTruthy();
    expect(screen.getByText("No data")).toBeTruthy();
  });

  test("renders custom description and children", () => {
    render(
      <Empty description="Nothing here">
        <button>Reload</button>
      </Empty>,
    );

    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
  });

  test("hides description when description is false", () => {
    const { container } = render(<Empty description={false} />);

    expect(container.querySelector(".empty")).toBeTruthy();
    expect(container.querySelector(".empty-description")).toBeNull();
  });

  test("supports custom className and static image constants", () => {
    const { container } = render(<Empty className="custom-empty" />);
    const empty = container.firstChild as HTMLElement;

    expect(empty.className).toContain("custom-empty");
    expect(Empty.PRESENTED_IMAGE_DEFAULT).toBeTruthy();
    expect(Empty.PRESENTED_IMAGE_SIMPLE).toBeTruthy();
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Empty ref={ref} />);

    expect(ref.current?.className).toContain("empty");
  });
});
