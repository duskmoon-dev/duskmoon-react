import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { QRCode } from "./QRCode";

describe("QRCode", () => {
  test("renders a canvas-style qr code by default", () => {
    const { container } = render(<QRCode value="https://example.com" />);

    const root = container.querySelector(".qr-code") as HTMLElement;

    expect(root.className).toContain("qr-code-type-canvas");
    expect(root.dataset.value).toBe("https://example.com");
    expect(screen.getByRole("img", { name: "QR code" })).toBeTruthy();
  });

  test("supports svg type, size, color, background, and border control", () => {
    const { container } = render(
      <QRCode
        value="dm"
        type="svg"
        size={96}
        color="#123456"
        bgColor="#eeeeee"
        bordered={false}
      />,
    );

    const root = container.querySelector(".qr-code") as HTMLElement;
    const svg = container.querySelector("svg") as SVGElement;

    expect(root.className).toContain("qr-code-type-svg");
    expect(root.style.width).toBe("96px");
    expect(root.style.backgroundColor).toBe("#eeeeee");
    expect(root.style.border).toBe("0px");
    expect(svg.querySelector("rect")?.getAttribute("fill")).toBe("#123456");
  });

  test("renders icon and expired refresh action", () => {
    const refreshes: string[] = [];

    render(
      <QRCode
        value="expired"
        icon="https://example.com/icon.png"
        status="expired"
        onRefresh={() => refreshes.push("refresh")}
      />,
    );

    expect(screen.getByText("QR code expired")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(refreshes).toEqual(["refresh"]);
  });

  test("supports loading and scanned status classes", () => {
    const { container, rerender } = render(
      <QRCode value="loading" status="loading" errorLevel="H" />,
    );

    const root = container.querySelector(".qr-code") as HTMLElement;
    expect(root.className).toContain("qr-code-loading");
    expect(root.className).toContain("qr-code-error-h");
    expect(screen.getByText("QR code loading")).toBeTruthy();

    rerender(<QRCode value="scanned" status="scanned" />);
    expect(root.className).toContain("qr-code-scanned");
    expect(screen.getByText("QR code scanned")).toBeTruthy();
  });
});
