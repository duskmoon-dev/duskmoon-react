import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import { getDmTheme, setDmPrimaryColor } from "../../infrastructure";
import { ConfigProvider } from "../config-provider";
import { DmProvider } from "./DmProvider";

function Probe() {
  const config = ConfigProvider.useConfig();

  return <span>{config.prefixCls}:{String(config.theme?.token?.colorPrimary)}</span>;
}

describe("DmProvider", () => {
  test("provides Dm prefix and theme defaults", () => {
    render(
      <DmProvider>
        <Probe />
      </DmProvider>,
    );

    expect(screen.getByText("dm:#0065ff")).toBeTruthy();
  });

  test("uses custom prefix and reacts to theme updates", () => {
    const { rerender } = render(
      <DmProvider prefixCls="custom">
        <Probe />
      </DmProvider>,
    );

    expect(screen.getByText("custom:#0065ff")).toBeTruthy();

    act(() => {
      setDmPrimaryColor("#ff0000");
    });
    rerender(
      <DmProvider prefixCls="custom">
        <Probe />
      </DmProvider>,
    );

    expect(getDmTheme().token.colorPrimary).toBe("#ff0000");
    expect(screen.getByText("custom:#ff0000")).toBeTruthy();

    act(() => {
      setDmPrimaryColor("#0065ff");
    });
  });
});
