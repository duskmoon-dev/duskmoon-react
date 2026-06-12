import React from "react";
import { afterEach, describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MessageHolder, message } from "./Message";

describe("message", () => {
  afterEach(() => {
    act(() => {
      message.destroy();
      message.config({ duration: 3, maxCount: undefined, placement: "top" });
    });
  });

  test("opens and renders typed messages", () => {
    render(<MessageHolder />);

    let handle: ReturnType<typeof message.success> | undefined;

    act(() => {
      handle = message.success("Saved", 0);
    });

    expect(handle?.key).toBeTruthy();
    expect(screen.getByText("Saved").parentElement?.className).toContain(
      "message-success",
    );
  });

  test("updates same keyed message and closes by key", () => {
    render(<MessageHolder />);

    act(() => {
      message.open({
        key: "job",
        type: "loading",
        content: "Loading",
        duration: 0,
      });
      message.open({
        key: "job",
        type: "success",
        content: "Done",
        duration: 0,
      });
    });

    expect(screen.queryByText("Loading")).toBeNull();
    expect(screen.getByText("Done")).toBeTruthy();

    act(() => {
      message.destroy("job");
    });
    expect(screen.queryByText("Done")).toBeNull();
  });

  test("supports max count and placement config", () => {
    const { container } = render(<MessageHolder />);

    act(() => {
      message.config({ maxCount: 1, placement: "bottom" });
      message.info("First", 0);
      message.error("Second", 0);
    });

    expect(screen.queryByText("First")).toBeNull();
    expect(screen.getByText("Second")).toBeTruthy();
    expect(container.querySelector(".message-holder")?.className).toContain(
      "message-bottom",
    );
  });

  test("supports close button and onClose", () => {
    const closed: string[] = [];
    render(<MessageHolder />);

    act(() => {
      message.warning({
        content: "Close me",
        duration: 0,
        onClose: () => closed.push("closed"),
      });
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Close message" }));
    });

    expect(screen.queryByText("Close me")).toBeNull();
    expect(closed).toEqual(["closed"]);
  });

  test("supports useMessage holder tuple", () => {
    const [api, holder] = message.useMessage();

    render(<>{holder}</>);
    act(() => {
      api.info("Hook message", 0);
    });

    expect(screen.getByText("Hook message")).toBeTruthy();
  });
});
