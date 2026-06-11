import React from "react";
import { describe, expect, it } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Image } from "./Image";

describe("Image", () => {
  it("renders image props and classes", () => {
    render(
      <Image
        src="https://example.com/photo.jpg"
        alt="Photo"
        width={120}
        height={80}
        data-testid="image"
      />,
    );

    const wrapper = screen.getByTestId("image").parentElement;
    const img = screen.getByRole("img", { name: "Photo" });

    expect(wrapper?.className).toContain("image");
    expect(img.getAttribute("src")).toBe("https://example.com/photo.jpg");
    expect(img.getAttribute("width")).toBe("120");
    expect(img.getAttribute("height")).toBe("80");
  });

  it("shows placeholder while loading and hides it after load", () => {
    render(<Image src="loading.jpg" alt="Loading" placeholder="Loading..." />);

    expect(screen.getByText("Loading...")).not.toBeNull();

    fireEvent.load(screen.getByRole("img", { name: "Loading" }));

    expect(screen.queryByText("Loading...")).toBeNull();
  });

  it("shows placeholder when src is missing", () => {
    render(<Image alt="Missing" placeholder="Waiting" />);

    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("Waiting")).not.toBeNull();
  });

  it("uses fallback source when the original image errors", () => {
    render(
      <Image src="broken.jpg" fallback="fallback.jpg" alt="With fallback" />,
    );

    const img = screen.getByRole("img", { name: "With fallback" });
    fireEvent.error(img);

    expect(img.getAttribute("src")).toBe("fallback.jpg");
  });

  it("calls onError when image fails", () => {
    let calls = 0;
    render(<Image src="broken.jpg" alt="Broken" onError={() => calls += 1} />);

    calls = 0;
    fireEvent.error(screen.getByRole("img", { name: "Broken" }));

    expect(calls).toBe(1);
  });

  it("renders PreviewGroup", () => {
    render(
      <Image.PreviewGroup preview={false} data-testid="group">
        <Image src="a.jpg" alt="A" />
      </Image.PreviewGroup>,
    );

    const group = screen.getByTestId("group");
    expect(group.className).toContain("image-preview-group");
    expect(group.getAttribute("data-preview-enabled")).toBeNull();
  });
});
