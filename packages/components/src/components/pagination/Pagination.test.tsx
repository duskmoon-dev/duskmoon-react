import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  test("renders total/current/pageSize parity state", () => {
    const { container } = render(
      <Pagination total={100} current={2} pageSize={10} />,
    );

    const page = screen.getByRole("button", { name: "Page 2" });

    expect(container.querySelector(".pagination")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Page 10" })).toBeTruthy();
    expect(page.className).toContain("pagination-item-active");
    expect(page.getAttribute("aria-current")).toBe("page");
  });

  test("calls onChange with page and pageSize when a page is clicked", () => {
    let nextPage = 0;
    let nextPageSize = 0;

    render(
      <Pagination
        total={50}
        defaultCurrent={1}
        pageSize={10}
        onChange={(page, size) => {
          nextPage = page;
          nextPageSize = size;
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(nextPage).toBe(3);
    expect(nextPageSize).toBe(10);
  });

  test("disables prev and next at pagination boundaries", () => {
    const { rerender } = render(
      <Pagination total={20} current={1} pageSize={10} />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Previous page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);

    rerender(<Pagination total={20} current={2} pageSize={10} />);

    expect(
      (
        screen.getByRole("button", {
          name: "Previous page",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    expect(
      (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test("supports size and className", () => {
    const { container } = render(
      <Pagination total={20} size="lg" className="custom-pagination" />,
    );

    const pagination = container.querySelector("nav");

    expect(pagination?.className).toContain("pagination-lg");
    expect(pagination?.className).toContain("custom-pagination");
  });

  test("renders simple mode with compact input controls", () => {
    const { container } = render(
      <Pagination total={30} current={2} pageSize={10} simple />,
    );

    expect(container.querySelector(".pagination-compact")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Page 2" })).toBeNull();
    expect(screen.getByLabelText("Current page")).toBeTruthy();
    expect(screen.getByText("/ 3")).toBeTruthy();
  });

  test("renders showTotal with current item range", () => {
    render(
      <Pagination
        total={25}
        current={2}
        pageSize={10}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
      />,
    );

    expect(screen.getByText("11-20 of 25").className).toContain(
      "pagination-info-text",
    );
  });

  test("supports quick jumper", () => {
    let nextPage = 0;

    render(
      <Pagination
        total={90}
        pageSize={10}
        showQuickJumper
        onChange={(page) => {
          nextPage = page;
        }}
      />,
    );

    const input = screen.getByLabelText("Jump to page");

    fireEvent.change(input, { target: { value: "7" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(nextPage).toBe(7);
  });

  test("supports page size changer", () => {
    let nextPage = 0;
    let nextPageSize = 0;

    render(
      <Pagination
        total={100}
        current={6}
        pageSize={10}
        showSizeChanger
        onChange={(page, size) => {
          nextPage = page;
          nextPageSize = size;
        }}
      />,
    );

    fireEvent.change(screen.getByLabelText("Page size"), {
      target: { value: "20" },
    });

    expect(nextPage).toBe(5);
    expect(nextPageSize).toBe(20);
  });
});
