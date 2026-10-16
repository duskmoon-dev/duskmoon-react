import React from "react";
import { describe, expect, spyOn, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Popconfirm } from "./Popconfirm";

function getSurface() {
  return document.querySelector<HTMLElement>(".popconfirm[popover]")!;
}

describe("Popconfirm", () => {
  test("preserves Fragment trigger clicks without invalid Fragment props", () => {
    const errors = spyOn(console, "error").mockImplementation(() => {});
    const changes: boolean[] = [];
    let clicks = 0;
    let canceled = false;

    try {
      render(
        <Popconfirm
          title="Confirm Fragment action"
          onOpenChange={(next) => changes.push(next)}
          onCancel={() => {
            canceled = true;
          }}
        >
          <>
            <button type="button" onClick={() => clicks++}>
              Fragment action
            </button>
          </>
        </Popconfirm>,
      );

      const surface = getSurface();
      expect(surface.matches(":popover-open")).toBe(false);

      fireEvent.click(screen.getByRole("button", { name: "Fragment action" }));

      expect(clicks).toBe(1);
      expect(surface.matches(":popover-open")).toBe(true);
      expect(changes).toEqual([true]);

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(canceled).toBe(true);
      expect(surface.matches(":popover-open")).toBe(false);
      expect(changes).toEqual([true, false]);
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  test("preserves server rendering of legacy text children used by generic docs previews", () => {
    const markup = renderToStaticMarkup(
      <Popconfirm title="Confirm">
        {"Delete draft" as unknown as React.ReactElement}
      </Popconfirm>,
    );

    expect(markup).toContain("Delete draft");
    expect(markup).toContain('popover="auto"');
    expect(markup).not.toContain('role="tooltip"');
  });

  test("renders title and description from click trigger", () => {
    render(
      <Popconfirm
        title="Delete item"
        description="This action cannot be undone"
      >
        <button type="button">Delete</button>
      </Popconfirm>,
    );

    const trigger = screen.getByRole("button", { name: "Delete" });

    expect(getSurface().className).not.toContain("popconfirm-open");

    fireEvent.click(trigger.parentElement as HTMLElement);

    expect(getSurface().className).toContain("popconfirm-open");
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
    expect(document.querySelector(".popconfirm[popover]")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "Action" })
        .parentElement as HTMLElement,
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));

    expect(confirmed).toBe(true);
    expect(document.querySelector(".popconfirm[popover]")).toBeNull();
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

    expect(getSurface()).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "OK" }).getAttribute("aria-busy"),
    ).toBe("true");

    await act(async () => {
      resolveConfirm();
      await confirmPromise;
    });

    expect(document.querySelector(".popconfirm[popover]")).toBeNull();
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

    const popup = getSurface();

    expect(popup.className).toContain("popconfirm-bottom-left");
    expect(popup.className).toContain("custom-popconfirm");
    expect(screen.getByText("?")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  test("uses a native surface with an associated real trigger and preserves descriptions", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <>
        <p id="delete-help">Deletes this draft</p>
        <Popconfirm ref={ref} defaultOpen title="Delete draft?">
          <button type="button" aria-describedby="delete-help">
            Delete draft
          </button>
        </Popconfirm>
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Delete draft" });
    const surface = getSurface();
    expect(surface.matches(":popover-open")).toBe(true);
    expect(surface.hasAttribute("role")).toBe(false);
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(trigger.getAttribute("aria-controls")).toBe(surface.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe("delete-help");
    expect(ref.current).toBe(trigger.parentElement as HTMLSpanElement);
    expect(ref.current?.style.anchorName).toMatch(/^--dm-popconfirm-/);
    expect(surface.style.positionAnchor).toBe(ref.current!.style.anchorName);
  });

  test("reports native light dismissal and closes uncontrolled state", () => {
    const changes: boolean[] = [];
    render(
      <Popconfirm
        defaultOpen
        title="Confirm"
        onOpenChange={(next) => changes.push(next)}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );

    const surface = getSurface();
    surface.hidePopover();
    fireEvent(
      surface,
      Object.assign(new Event("toggle", { bubbles: true }), {
        newState: "closed",
      }),
    );

    expect(changes).toEqual([false]);
    expect(surface.matches(":popover-open")).toBe(false);
    expect(
      screen
        .getByRole("button", { name: "Action" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  test("native dismissal requests do not override controlled open state", async () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <Popconfirm
        open
        title="Confirm"
        onOpenChange={(next) => changes.push(next)}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );

    const surface = getSurface();
    surface.hidePopover();
    await act(async () => {
      fireEvent(
        surface,
        Object.assign(new Event("toggle", { bubbles: true }), {
          newState: "closed",
        }),
      );
      await Promise.resolve();
    });

    expect(changes).toEqual([false]);
    expect(surface.matches(":popover-open")).toBe(true);
    rerender(
      <Popconfirm
        open={false}
        title="Confirm"
        onOpenChange={(next) => changes.push(next)}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );
    expect(surface.matches(":popover-open")).toBe(false);
  });

  test("rejected confirmation leaves native controls available for another action", async () => {
    let rejectConfirm: (reason: Error) => void = () => {};
    const pending = new Promise<void>((_, reject) => {
      rejectConfirm = reject;
    });
    let canceled = false;
    render(
      <Popconfirm
        defaultOpen
        title="Confirm"
        onConfirm={() => pending}
        onCancel={() => {
          canceled = true;
        }}
      >
        <button type="button">Action</button>
      </Popconfirm>,
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(getSurface().matches(":popover-open")).toBe(true);
    expect(
      screen.getByRole("button", { name: "OK" }).getAttribute("aria-busy"),
    ).toBe("true");
    await act(async () => {
      rejectConfirm(new Error("Request failed"));
      await pending.catch(() => {});
    });

    expect(getSurface().matches(":popover-open")).toBe(true);
    expect(
      screen.getByRole("button", { name: "OK" }).getAttribute("aria-busy"),
    ).not.toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(canceled).toBe(true);
    expect(getSurface().matches(":popover-open")).toBe(false);
  });

  test("releases native popover state on unmount", () => {
    const { unmount } = render(
      <Popconfirm defaultOpen title="Confirm">
        <button type="button">Action</button>
      </Popconfirm>,
    );
    const surface = getSurface();
    expect(surface.matches(":popover-open")).toBe(true);

    unmount();

    expect(surface.matches(":popover-open")).toBe(false);
  });
});
