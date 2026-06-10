import React from "react";
import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("renders with default classes", () => {
    render(<Avatar data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    expect(avatar.className).toContain("avatar");
    expect(avatar.className).toContain("avatar-md");
    expect(avatar.className).toContain("avatar-circle");
  });

  it("renders with custom size and shape", () => {
    render(<Avatar size="lg" shape="square" data-testid="avatar" />);
    const avatar = screen.getByTestId("avatar");
    expect(avatar.className).toContain("avatar-lg");
    expect(avatar.className).toContain("avatar-square");
  });

  it("renders image when src is provided", () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="test alt" />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toBe("https://example.com/avatar.jpg");
    expect(img.getAttribute("alt")).toBe("test alt");
  });

  it("renders fallback when image fails to load", () => {
    render(<Avatar src="https://example.com/invalid.jpg" fallback="FB" />);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("FB")).not.toBeNull();
  });

  it("renders children as fallback when image fails to load and no fallback prop provided", () => {
    render(<Avatar src="https://example.com/invalid.jpg">CH</Avatar>);
    const img = screen.getByRole("img");
    fireEvent.error(img);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("CH")).not.toBeNull();
  });

  it("renders fallback when no src is provided", () => {
    render(<Avatar fallback="FB" />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("FB")).not.toBeNull();
  });
});
