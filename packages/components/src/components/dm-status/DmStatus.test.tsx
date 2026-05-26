import React from "react";
import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { DmStatus } from "./DmStatus";

describe("DmStatus", () => {
  test("renders empty status with default description and numeric height", () => {
    const { container } = render(<DmStatus height={240} />);
    const root = container.querySelector(".dm-status") as HTMLElement;

    expect(root.className).toContain("dm-status-empty");
    expect(root.style.height).toBe("240px");
    expect(screen.getByText("No data")).toBeTruthy();
  });

  test("renders error status with custom description and action", () => {
    render(
      <DmStatus status="error" description="Request failed">
        <button>Retry</button>
      </DmStatus>,
    );

    expect(screen.getByText("Request failed")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  test("renders loading status with spin props and children", () => {
    render(
      <DmStatus status="loading" loadingProps={{ tip: "Loading data" }}>
        <span>Content</span>
      </DmStatus>,
    );

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("Loading data")).toBeTruthy();
    expect(screen.getByText("Content")).toBeTruthy();
  });

  test("returns children directly for success status", () => {
    const { container } = render(
      <DmStatus status="success">
        <strong>Ready</strong>
      </DmStatus>,
    );

    expect(container.querySelector(".dm-status")).toBeNull();
    expect(screen.getByText("Ready")).toBeTruthy();
  });

  test("supports custom image string and className", () => {
    const { container } = render(
      <DmStatus
        className="custom-status"
        image="/empty.svg"
        imageStyle={{ width: 48 }}
      />,
    );

    expect(container.querySelector(".custom-status")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/empty.svg",
    );
  });
});

