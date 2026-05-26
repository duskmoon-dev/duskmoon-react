import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ConfigProvider } from "./ConfigProvider";

function Probe() {
  const config = ConfigProvider.useConfig();

  return (
    <span>
      {config.prefixCls}:{config.iconPrefixCls}:{config.direction}:
      {String(config.virtual)}
    </span>
  );
}

describe("ConfigProvider", () => {
  test("provides config values and root direction classes", () => {
    const { container } = render(
      <ConfigProvider
        prefixCls="custom"
        iconPrefixCls="icon"
        direction="rtl"
        virtual={false}
        className="custom-config"
      >
        <Probe />
      </ConfigProvider>,
    );

    const root = container.querySelector(".config-provider") as HTMLElement;

    expect(root.className).toContain("config-provider-rtl");
    expect(root.className).toContain("custom-config");
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(screen.getByText("custom:icon:rtl:false")).toBeTruthy();
  });

  test("supports nested merge and fragment mode", () => {
    render(
      <ConfigProvider prefixCls="outer">
        <ConfigProvider component={false} direction="rtl">
          <Probe />
        </ConfigProvider>
      </ConfigProvider>,
    );

    expect(screen.getByText("outer:dmicon:rtl:true")).toBeTruthy();
  });

  test("supports global config defaults", () => {
    ConfigProvider.config({ prefixCls: "global" });

    render(
      <ConfigProvider>
        <Probe />
      </ConfigProvider>,
    );

    expect(screen.getByText("global:dmicon:ltr:true")).toBeTruthy();

    ConfigProvider.config({ prefixCls: "dm" });
  });
});
