import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmPagination } from "./DmPagination";

describe("DmPagination", () => {
  test("renders workflow total, selected count, pager, refresh, and alignment", () => {
    const { container } = render(
      <DmPagination
        total={120}
        selectedTotal={3}
        current={2}
        pageSize={10}
        refresh={() => undefined}
      />,
    );

    expect(container.querySelector(".dm-pagination")).toBeTruthy();
    expect(container.querySelector(".dm-pagination-right")).toBeTruthy();
    expect(container.querySelector(".dm-pagination-pager")).toBeTruthy();
    expect(container.querySelector(".dm-pagination-refresh")).toBeTruthy();
    expect(screen.getByText("11-20 of 120")).toBeTruthy();
    expect(screen.getByText(", 3 selected").className).toContain(
      "dm-pagination-selected",
    );
    expect(screen.getByRole("button", { name: "Page 2" }).className).toContain(
      "pagination-item-active",
    );
    expect(screen.getByRole("button", { name: /Refresh/ })).toBeTruthy();
  });

  test("calls refresh and supports loading state", () => {
    let refreshed = 0;

    render(
      <DmPagination
        total={20}
        loading
        refresh={() => {
          refreshed += 1;
        }}
      />,
    );

    const refresh = screen.getByRole("button", { name: /Refresh/ });

    expect(refresh.className).toContain("dm-pagination-refresh-loading");
    expect((refresh as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(refresh);
    expect(refreshed).toBe(0);
  });

  test("can render refresh only or hide entirely", () => {
    const { rerender } = render(
      <DmPagination
        total={0}
        showPagination={false}
        refresh={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: /Refresh/ })).toBeTruthy();
    expect(screen.queryByRole("navigation")).toBeNull();

    rerender(<DmPagination total={0} showPagination={false} showRefresh={false} />);

    expect(screen.queryByRole("button", { name: /Refresh/ })).toBeNull();
  });

  test("keeps primitive pagination callbacks and custom locale", () => {
    let nextPage = 0;
    let nextSize = 0;

    render(
      <DmPagination
        total={50}
        pageSize={10}
        align="left"
        locale={{
          refresh: "Reload list",
          showTotal: (total, range) => `${range[0]}:${range[1]}:${total}`,
        }}
        onChange={(page, size) => {
          nextPage = page;
          nextSize = size;
        }}
        refresh={() => undefined}
      />,
    );

    expect(screen.getByText("1:10:50")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Reload list/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));

    expect(nextPage).toBe(3);
    expect(nextSize).toBe(10);
  });

  test("forwards the wrapper ref", () => {
    const ref = createRef<HTMLDivElement>();

    render(<DmPagination ref={ref} total={10} />);

    expect(ref.current?.className).toContain("dm-pagination");
  });
});
