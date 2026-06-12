import React from "react";
import { afterEach, describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { message } from "../message";
import { DmMessage, DmMessageContent, DmMessageHolder } from "./DmMessage";

describe("DmMessage", () => {
  afterEach(() => {
    act(() => {
      DmMessage.destroy();
      message.config({ duration: 3, maxCount: undefined, placement: "top" });
    });
  });

  test("renders decoded multiline message content", () => {
    const { container } = render(
      <DmMessageContent content="Line 1&lt;br/&gt;Line &amp; 2" />,
    );

    expect(container.querySelector(".dm-message-content")).toBeTruthy();
    expect(screen.getByText("Line 1")).toBeTruthy();
    expect(screen.getByText("Line & 2")).toBeTruthy();
  });

  test("opens typed messages with Dm API and keyed replacement", () => {
    render(<DmMessageHolder />);

    act(() => {
      DmMessage.loading("Loading", "job");
      DmMessage.success("Done", "job");
    });

    expect(screen.queryByText("Loading")).toBeNull();
    expect(screen.getByText("Done").closest(".message")?.className).toContain(
      "message-success",
    );
  });

  test("opens default info messages and destroys by key", () => {
    render(<DmMessageHolder />);

    act(() => {
      DmMessage.open("Hello", "notice");
    });

    expect(screen.getByText("Hello").closest(".message")?.className).toContain(
      "message-info",
    );

    act(() => {
      DmMessage.destroy("notice");
    });

    expect(screen.queryByText("Hello")).toBeNull();
  });

  test("limits visible messages to three", () => {
    render(<DmMessageHolder />);

    act(() => {
      DmMessage.info("One", "one");
      DmMessage.info("Two", "two");
      DmMessage.info("Three", "three");
      DmMessage.info("Four", "four");
    });

    expect(screen.queryByText("One")).toBeNull();
    expect(screen.getByText("Two")).toBeTruthy();
    expect(screen.getByText("Three")).toBeTruthy();
    expect(screen.getByText("Four")).toBeTruthy();
  });
});
