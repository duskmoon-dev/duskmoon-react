import { expect, test, describe, mock } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { Statistic } from "./Statistic";

describe("Statistic", () => {
  test("renders title, value, prefix, and suffix", () => {
    render(
      <Statistic
        title="Active"
        value={1234.567}
        precision={2}
        prefix="$"
        suffix="USD"
      />,
    );

    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("$")).toBeTruthy();
    expect(screen.getByText("1234.57")).toBeTruthy();
    expect(screen.getByText("USD")).toBeTruthy();
  });

  test("uses formatter before precision formatting", () => {
    render(
      <Statistic
        value={12.345}
        precision={2}
        formatter={(value) => `~${value}`}
      />,
    );

    expect(screen.getByText("~12.345")).toBeTruthy();
  });

  test("applies native div props, custom classes, and valueStyle", () => {
    const { container } = render(
      <Statistic
        data-testid="stat"
        className="custom-stat"
        value={42}
        valueStyle={{ color: "red" }}
      />,
    );

    const statistic = screen.getByTestId("stat");
    expect(statistic.className).toContain("statistic");
    expect(statistic.className).toContain("custom-stat");
    expect(
      container.querySelector(".statistic-value")?.getAttribute("style"),
    ).toContain("color: red");
  });
});

describe("Statistic.Countdown", () => {
  test("renders formatted remaining time", () => {
    render(<Statistic.Countdown value={Date.now() + 3661000} format="H:m" />);

    expect(screen.getByText("1:1")).toBeTruthy();
  });

  test("calls onChange and onFinish", async () => {
    const onChange = mock();
    const onFinish = mock();

    render(
      <Statistic.Countdown
        value={Date.now() - 1}
        onChange={onChange}
        onFinish={onFinish}
      />,
    );

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(0));
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
  });
});
