import React from "react";
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { DmInfiniteScroll } from "./DmInfiniteScroll";

function defineScrollState(
  element: HTMLElement,
  values: Partial<
    Record<"clientHeight" | "scrollHeight" | "scrollTop", number>
  >,
) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
      writable: key === "scrollTop",
    });
  }
}

describe("DmInfiniteScroll", () => {
  test("renders prefixed scroll container and children", () => {
    render(
      <DmInfiniteScroll
        id="users"
        dataLength={1}
        hasMore={false}
        next={() => undefined}
        endMessage="Done"
      >
        <div>Ada</div>
      </DmInfiniteScroll>,
    );

    const container = document.getElementById("dm-scroll-container-users");

    expect(container?.className).toContain("dm-infinite-scroll");
    expect(screen.getByText("Ada")).toBeTruthy();
    expect(screen.getByText("Done")).toBeTruthy();
  });

  test("calls next once when ratio threshold is reached", () => {
    let calls = 0;
    const scrollEvents: number[] = [];

    render(
      <DmInfiniteScroll
        id="events"
        dataLength={3}
        hasMore
        next={() => {
          calls += 1;
        }}
        onScroll={(event) => scrollEvents.push(event.currentTarget.scrollTop)}
      >
        <div>Rows</div>
      </DmInfiniteScroll>,
    );

    const container = document.getElementById(
      "dm-scroll-container-events",
    ) as HTMLElement;
    defineScrollState(container, {
      clientHeight: 100,
      scrollHeight: 500,
      scrollTop: 300,
    });

    fireEvent.scroll(container);
    fireEvent.scroll(container);

    expect(calls).toBe(1);
    expect(scrollEvents).toEqual([300, 300]);
    expect(screen.getByRole("status").textContent).toContain("Loading");
  });

  test("unlocks next when dataLength changes", () => {
    let calls = 0;
    const { rerender } = render(
      <DmInfiniteScroll
        id="paged"
        dataLength={2}
        hasMore
        next={() => {
          calls += 1;
        }}
      >
        <div>Rows</div>
      </DmInfiniteScroll>,
    );

    const container = document.getElementById(
      "dm-scroll-container-paged",
    ) as HTMLElement;
    defineScrollState(container, {
      clientHeight: 100,
      scrollHeight: 500,
      scrollTop: 400,
    });

    fireEvent.scroll(container);

    rerender(
      <DmInfiniteScroll
        id="paged"
        dataLength={4}
        hasMore
        next={() => {
          calls += 1;
        }}
      >
        <div>Rows</div>
      </DmInfiniteScroll>,
    );

    fireEvent.scroll(container);

    expect(calls).toBe(2);
  });

  test("supports pixel threshold, inverse mode, custom prefix, and loader", () => {
    let calls = 0;

    render(
      <DmInfiniteScroll
        id="feed"
        prefix="custom"
        dataLength={4}
        hasMore
        inverse
        scrollThreshold="24px"
        loader={<span role="status">Fetching</span>}
        next={() => {
          calls += 1;
        }}
      >
        <div>Rows</div>
      </DmInfiniteScroll>,
    );

    const container = document.getElementById("custom-feed") as HTMLElement;
    defineScrollState(container, {
      clientHeight: 100,
      scrollHeight: 500,
      scrollTop: 12,
    });

    fireEvent.scroll(container);

    expect(container.className).toContain("dm-infinite-scroll-inverse");
    expect(calls).toBe(1);
    expect(screen.getByRole("status").textContent).toBe("Fetching");
  });
});
