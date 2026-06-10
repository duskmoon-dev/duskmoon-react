import React, { createRef } from "react";
import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Carousel } from "./Carousel";
import type { CarouselRef } from "./Carousel.types";

describe("Carousel", () => {
  test("renders slides, dots, and arrows", () => {
    const { container } = render(
      <Carousel arrows defaultActiveIndex={1}>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );

    const root = container.querySelector(".carousel") as HTMLElement;

    expect(root.dataset.activeIndex).toBe("1");
    expect(root.className).toContain("carousel-scrollx");
    expect(screen.getByText("Two").parentElement?.className).toContain(
      "carousel-slide-active",
    );
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toBeTruthy();
  });

  test("supports uncontrolled navigation callbacks", () => {
    const changes: string[] = [];
    const { container } = render(
      <Carousel
        arrows
        beforeChange={(from, to) => changes.push(`before:${from}-${to}`)}
        afterChange={(current) => changes.push(`after:${current}`)}
        onChange={(current, previous) => changes.push(`change:${previous}-${current}`)}
      >
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));

    expect((container.querySelector(".carousel") as HTMLElement).dataset.activeIndex).toBe(
      "1",
    );
    expect(changes).toEqual(["before:0-1", "change:0-1", "after:1"]);
  });

  test("supports controlled active index and dots config", () => {
    const { container } = render(
      <Carousel activeIndex={1} dots={{ className: "custom-dots" }}>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );

    expect((container.querySelector(".carousel") as HTMLElement).dataset.activeIndex).toBe(
      "1",
    );
    expect(container.querySelector(".custom-dots")).toBeTruthy();
  });

  test("supports fade effect and imperative ref", () => {
    const ref = createRef<CarouselRef>();
    const { container } = render(
      <Carousel ref={ref} effect="fade" arrows>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );

    act(() => {
      ref.current?.goTo(1);
    });

    const root = container.querySelector(".carousel") as HTMLElement;
    expect(root.className).toContain("carousel-fade");
    expect(root.dataset.activeIndex).toBe("1");
  });

  test("supports autoplay", () => {
    const originalSetInterval = window.setInterval;
    const originalClearInterval = window.clearInterval;
    const callbacks: Array<() => void> = [];

    window.setInterval = ((callback: TimerHandler) => {
      callbacks.push(callback as () => void);
      return 1;
    }) as typeof window.setInterval;
    window.clearInterval = (() => undefined) as typeof window.clearInterval;

    try {
      const { container } = render(
        <Carousel autoplay autoplaySpeed={10}>
          <div>One</div>
          <div>Two</div>
        </Carousel>,
      );

      act(() => {
        callbacks[0]?.();
      });

      expect(
        (container.querySelector(".carousel") as HTMLElement).dataset.activeIndex,
      ).toBe("1");
    } finally {
      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
    }
  });
});
