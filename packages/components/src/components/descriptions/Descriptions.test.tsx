import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";
import { Descriptions } from "./Descriptions";

describe("Descriptions", () => {
  test("renders title and children items", () => {
    render(
      <Descriptions title="User info">
        <Descriptions.Item label="Name">Ada</Descriptions.Item>
        <Descriptions.Item label="Age">36</Descriptions.Item>
      </Descriptions>,
    );

    expect(screen.getByText("User info")).toBeTruthy();
    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Age")).toBeTruthy();
    expect(screen.getByText("36")).toBeTruthy();
  });

  test("renders items prop and extra content", () => {
    render(
      <Descriptions
        title="Billing"
        extra={<button type="button">Edit</button>}
        items={[
          { key: "product", label: "Product", children: "Cloud Database" },
          { key: "amount", label: "Amount", children: "$80.00" },
        ]}
      />,
    );

    expect(screen.getByText("Billing")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Product")).toBeTruthy();
    expect(screen.getByText("Cloud Database")).toBeTruthy();
    expect(screen.getByText("Amount")).toBeTruthy();
    expect(screen.getByText("$80.00")).toBeTruthy();
  });

  test("applies bordered, size, layout, column, span, and custom class", () => {
    const { container } = render(
      <Descriptions
        bordered
        size="small"
        layout="vertical"
        column={4}
        className="custom-descriptions"
        items={[
          { label: "A", children: "1", span: 2 },
          { label: "B", children: "2" },
        ]}
      />,
    );
    const root = container.firstChild as HTMLElement;
    const body = container.querySelector(".descriptions-body") as HTMLElement;
    const item = container.querySelector(".descriptions-item") as HTMLElement;

    expect(root.className).toContain("descriptions");
    expect(root.className).toContain("descriptions-bordered");
    expect(root.className).toContain("descriptions-sm");
    expect(root.className).toContain("descriptions-vertical");
    expect(root.className).toContain("custom-descriptions");
    expect(body.getAttribute("style")).toContain("repeat(4");
    expect(item.getAttribute("style")).toContain("span 2");
  });

  test("applies root and item label/content styles", () => {
    const { container } = render(
      <Descriptions
        labelStyle={{ color: "red" }}
        contentStyle={{ color: "blue" }}
        items={[
          {
            label: "Label",
            children: "Value",
            labelStyle: { fontWeight: "bold" },
            contentStyle: { fontStyle: "italic" },
          },
        ]}
      />,
    );

    const label = container.querySelector(
      ".descriptions-item-label",
    ) as HTMLElement;
    const content = container.querySelector(
      ".descriptions-item-content",
    ) as HTMLElement;

    expect(label.getAttribute("style")).toContain("color: red");
    expect(label.getAttribute("style")).toContain("font-weight: bold");
    expect(content.getAttribute("style")).toContain("color: blue");
    expect(content.getAttribute("style")).toContain("font-style: italic");
  });

  test("forwards root ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Descriptions ref={ref} />);

    expect(ref.current?.className).toContain("descriptions");
  });
});
