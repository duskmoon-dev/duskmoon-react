import React from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Popconfirm } from "./Popconfirm";

describe("Popconfirm", () => {
  test("renders title and description from click trigger", () => {
    render(
      <Popconfirm title="Delete item" description="This action cannot be undone">
        <button type="button">Delete</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole("button", { name: "Delete" });

    expect(screen.getByRole("tooltip").className).not.toContain(
      "popconfirm-open",
    );

    fireEvent.click(trigger.parentElement as HTMLElement);

    expect(screen.getByRole("tooltip").className).toContain("popconfirm-open");
    expect(screen.getByText("Delete item")).toBeTruthy();
    expect(screen.getByText("This action cannot be undone")).toBeTruthy();
  });

  test("calls confirm and cancel callbacks, then closes uncontrolled popup", () => {
    let confirmed = false;
    let canceled = false;

    render(
      <Popconfirm
        defaultOpen
        destroyTooltipOnHide
        title="Confirm"
        onConfirm={() => {
          confirmed = true;
        }}
        onCancel={() => {
          canceled = true;
        }}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(canceled).toBe(true);
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Action" }).parentElement as HTMLElement);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(confirmed).toBe(true);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  test("keeps popup open until async confirm resolves", async () => {
    let resolveConfirm: () => void = () => {};
    const confirmPromise = new Promise<void>((resolve) => {
      resolveConfirm = resolve;
    });

    render(
      <Popconfirm
        defaultOpen
        destroyTooltipOnHide
        title="Confirm"
        onConfirm={() => confirmPromise}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(screen.getByRole("tooltip")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "OK" }).getAttribute("aria-busy"),
    ).toBe("true");

    await act(async () => {
      resolveConfirm();
      await confirmPromise;
    });

    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  test("supports placement, hover trigger, custom icon, and hidden cancel", () => {
    render(
      <Popconfirm
        title="Archive"
        placement="bottomLeft"
        trigger="hover"
        icon={<span>?</span>}
        showCancel={false}
        className="custom-popconfirm"
      >
        <button type="button">Archive</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole("button", { name: "Archive" });

    fireEvent.mouseEnter(trigger.parentElement as HTMLElement);

    const popup = screen.getByRole("tooltip");

    expect(popup.className).toContain("popconfirm-bottom-left");
    expect(popup.className).toContain("custom-popconfirm");
    expect(screen.getByText("?")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});
