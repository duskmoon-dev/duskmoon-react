import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Tour } from "./Tour";

describe("Tour", () => {
  test("renders the current step when open", () => {
    render(
      <Tour
        open
        steps={[
          {
            title: "Welcome",
            description: "Start here",
          },
        ]}
      />,
    );

    expect(screen.getByRole("dialog").className).toContain("tour-bottom");
    expect(screen.getByText("Welcome")).toBeTruthy();
    expect(screen.getByText("Start here")).toBeTruthy();
    expect(document.querySelector(".tour-mask")).toBeTruthy();
  });

  test("supports uncontrolled step changes and finish close", () => {
    const changes: number[] = [];
    let finished = false;
    let closedAt = -1;

    render(
      <Tour
        defaultOpen
        onChange={(nextCurrent) => changes.push(nextCurrent)}
        onFinish={() => {
          finished = true;
        }}
        onClose={(current) => {
          closedAt = current;
        }}
        steps={[
          { title: "First", description: "One" },
          { title: "Second", description: "Two" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(changes).toEqual([1]);
    expect(screen.getByText("Second")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(changes).toEqual([1, 0]);
    expect(screen.getByText("First")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));

    expect(finished).toBe(true);
    expect(closedAt).toBe(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  test("honors controlled current and custom indicators", () => {
    const changes: number[] = [];

    render(
      <Tour
        open
        current={1}
        indicators={(current, total) => (
          <span>{`${current + 1} / ${total}`}</span>
        )}
        onChange={(nextCurrent) => changes.push(nextCurrent)}
        steps={[{ title: "First" }, { title: "Second" }, { title: "Third" }]}
      />,
    );

    expect(screen.getByText("Second")).toBeTruthy();
    expect(screen.getByText("2 / 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(changes).toEqual([2]);
    expect(screen.getByText("Second")).toBeTruthy();
  });

  test("applies placement, target highlight, and mask config", () => {
    const target = document.createElement("button");
    document.body.appendChild(target);
    target.getBoundingClientRect = () =>
      ({
        top: 20,
        left: 30,
        width: 120,
        height: 40,
        right: 150,
        bottom: 60,
        x: 30,
        y: 20,
        toJSON: () => ({}),
      }) as DOMRect;

    render(
      <Tour
        open
        placement="right"
        mask={{ className: "custom-mask", color: "rgba(0, 0, 0, 0.4)" }}
        steps={[
          {
            title: "Targeted",
            target,
            placement: "leftTop",
          },
        ]}
      />,
    );

    expect(screen.getByRole("dialog").className).toContain("tour-left-top");
    expect(document.querySelector(".tour-target")).toBeTruthy();
    expect(document.querySelector(".tour-mask")?.className).toContain(
      "custom-mask",
    );

    document.body.removeChild(target);
  });

  test("supports close callbacks and hidden mask or indicators", () => {
    let closedAt = -1;
    let stepClosedAt = -1;

    render(
      <Tour
        open
        mask={false}
        indicators={false}
        onClose={(current) => {
          closedAt = current;
        }}
        steps={[
          {
            title: "Closable",
            onClose: (current) => {
              stepClosedAt = current;
            },
          },
        ]}
      />,
    );

    expect(document.querySelector(".tour-mask")).toBeNull();
    expect(document.querySelector(".tour-indicators")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close tour" }));

    expect(closedAt).toBe(0);
    expect(stepClosedAt).toBe(0);
  });
});
