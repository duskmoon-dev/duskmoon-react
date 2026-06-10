import { describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { Grid, useBreakpoint, useWatch } from "./Grid";

type MatchMediaEntry = {
  matches: boolean;
  listeners: Set<(event: MediaQueryListEvent) => void>;
};

type MatchMediaListener =
  | ((event: MediaQueryListEvent) => void)
  | ((this: MediaQueryList, event: MediaQueryListEvent) => void)
  | null;

function installMatchMedia(matchesByQuery: Record<string, boolean>) {
  const entries = new Map<string, MatchMediaEntry>();

  window.matchMedia = ((query: string) => {
    const entry =
      entries.get(query) ??
      ({
        matches: Boolean(matchesByQuery[query]),
        listeners: new Set<(event: MediaQueryListEvent) => void>(),
      } satisfies MatchMediaEntry);

    entries.set(query, entry);

    return {
      media: query,
      get matches() {
        return entry.matches;
      },
      onchange: null,
      addEventListener: (_event: "change", listener: MatchMediaListener) => {
        if (listener) {
          entry.listeners.add(listener as (event: MediaQueryListEvent) => void);
        }
      },
      removeEventListener: (_event: "change", listener: MatchMediaListener) => {
        if (listener) {
          entry.listeners.delete(listener as (event: MediaQueryListEvent) => void);
        }
      },
      addListener: (listener: MatchMediaListener) => {
        if (listener) {
          entry.listeners.add(listener as (event: MediaQueryListEvent) => void);
        }
      },
      removeListener: (listener: MatchMediaListener) => {
        if (listener) {
          entry.listeners.delete(listener as (event: MediaQueryListEvent) => void);
        }
      },
      dispatchEvent: () => true,
    } as MediaQueryList;
  }) as typeof window.matchMedia;

  return {
    set(query: string, matches: boolean) {
      const entry = entries.get(query);

      if (!entry) {
        return;
      }

      entry.matches = matches;
      entry.listeners.forEach((listener) => {
        listener({ matches, media: query } as MediaQueryListEvent);
      });
    },
  };
}

function BreakpointProbe() {
  const screens = useBreakpoint();

  return (
    <output aria-label="screens">
      {JSON.stringify(screens)}
    </output>
  );
}

function WatchProbe() {
  const md = Grid.useWatch("md");
  const desktop = useWatch((screens) => screens.lg || screens.xl || screens.xxl);

  return (
    <>
      <output aria-label="md">{String(md)}</output>
      <output aria-label="desktop">{String(desktop)}</output>
    </>
  );
}

describe("Grid", () => {
  test("exports hook helpers on the Grid object", () => {
    expect(Grid.useBreakpoint).toBe(useBreakpoint);
    expect(Grid.useWatch).toBe(useWatch);
  });

  test("returns a complete fallback screen map without matchMedia", () => {
    const originalMatchMedia = window.matchMedia;

    delete (window as Partial<Window>).matchMedia;

    render(<BreakpointProbe />);

    expect(screen.getByLabelText("screens").textContent).toBe(
      JSON.stringify({
        xs: false,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        xxl: false,
      }),
    );

    window.matchMedia = originalMatchMedia;
  });

  test("reads breakpoint state from matchMedia", () => {
    installMatchMedia({
      "(max-width: 575px)": false,
      "(min-width: 576px)": true,
      "(min-width: 768px)": true,
      "(min-width: 992px)": false,
      "(min-width: 1200px)": false,
      "(min-width: 1600px)": false,
    });

    render(<BreakpointProbe />);

    expect(screen.getByLabelText("screens").textContent).toBe(
      JSON.stringify({
        xs: false,
        sm: true,
        md: true,
        lg: false,
        xl: false,
        xxl: false,
      }),
    );
  });

  test("updates subscribers and supports useWatch selectors", () => {
    const media = installMatchMedia({
      "(max-width: 575px)": false,
      "(min-width: 576px)": true,
      "(min-width: 768px)": false,
      "(min-width: 992px)": false,
      "(min-width: 1200px)": false,
      "(min-width: 1600px)": false,
    });

    render(<WatchProbe />);

    expect(screen.getByLabelText("md").textContent).toBe("false");
    expect(screen.getByLabelText("desktop").textContent).toBe("false");

    act(() => {
      media.set("(min-width: 768px)", true);
      media.set("(min-width: 992px)", true);
    });

    expect(screen.getByLabelText("md").textContent).toBe("true");
    expect(screen.getByLabelText("desktop").textContent).toBe("true");
  });
});
