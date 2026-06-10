import { expect, test, describe } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Timeline } from "./Timeline";

describe("Timeline", () => {
  test("renders item children with default timeline classes", () => {
    const items = [
      { children: "Created" },
      { children: "Initialized" },
      { children: "Deployed" },
    ];
    const { container } = render(<Timeline items={items} />);

    expect(container.querySelector(".timeline")).toBeTruthy();
    expect(container.querySelectorAll(".timeline-item").length).toBe(3);
    expect(screen.getByText("Created")).toBeTruthy();
    expect(screen.getByText("Initialized")).toBeTruthy();
    expect(screen.getByText("Deployed")).toBeTruthy();
  });

  test("supports className and alternate mode", () => {
    const { container } = render(
      <Timeline
        className="custom-timeline"
        mode="alternate"
        items={[{ children: "Event" }]}
      />,
    );

    expect(container.querySelector(".custom-timeline")).toBeTruthy();
    expect(container.querySelector(".timeline-alternate")).toBeTruthy();
  });

  test("supports label, color, dot, pending, and reverse", () => {
    const { container } = render(
      <Timeline
        reverse
        pending="More"
        items={[
          { label: "09:00", children: "First", color: "success" },
          { children: "Second", dot: "!" },
        ]}
      />,
    );

    expect(screen.getByText("09:00").className).toContain("timeline-time");
    expect(container.querySelector(".timeline-marker-success")).toBeTruthy();
    expect(container.querySelector(".timeline-marker-icon")).toBeTruthy();
    expect(container.querySelector(".timeline-item-pending")).toBeTruthy();
    expect(
      (container.querySelector(".timeline-item") as HTMLElement).textContent,
    ).toContain("More");
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Timeline ref={ref} items={[{ children: "Event" }]} />);

    expect(ref.current?.className).toContain("timeline");
  });
});
