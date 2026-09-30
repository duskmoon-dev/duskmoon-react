import { useMemo, useSyncExternalStore } from "react";
import { gridBreakpointQueries, gridBreakpoints } from "../../classes/grid";
import type {
  Breakpoint,
  BreakpointScreenInput,
  BreakpointScreenMap,
} from "./Grid.types";

type MediaQueryListWithLegacyEvents = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

const defaultScreens = gridBreakpoints.reduce((screens, breakpoint) => {
  screens[breakpoint] = false;
  return screens;
}, {} as BreakpointScreenMap);

let mediaQueries: Partial<Record<Breakpoint, MediaQueryListWithLegacyEvents>> =
  {};
let matchMediaSource: typeof window.matchMedia | undefined;
let currentScreens = defaultScreens;

function normalizeScreens(
  screens: BreakpointScreenInput = {},
): BreakpointScreenMap {
  return gridBreakpoints.reduce(
    (normalized, breakpoint) => {
      normalized[breakpoint] = Boolean(screens[breakpoint]);
      return normalized;
    },
    { ...defaultScreens },
  );
}

function canUseMatchMedia() {
  return (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
  );
}

function getMediaQueries() {
  if (!canUseMatchMedia()) {
    return {};
  }

  if (matchMediaSource !== window.matchMedia) {
    matchMediaSource = window.matchMedia;
    mediaQueries = {};
  }

  mediaQueries = gridBreakpoints.reduce(
    (queries, breakpoint) => {
      queries[breakpoint] =
        queries[breakpoint] ??
        window.matchMedia(gridBreakpointQueries[breakpoint]);
      return queries;
    },
    { ...mediaQueries },
  );

  return mediaQueries;
}

function getCurrentScreens() {
  const queries = getMediaQueries();

  const nextScreens = normalizeScreens(
    gridBreakpoints.reduce<BreakpointScreenInput>((screens, breakpoint) => {
      screens[breakpoint] = Boolean(queries[breakpoint]?.matches);
      return screens;
    }, {}),
  );

  const hasChanged = gridBreakpoints.some(
    (breakpoint) => currentScreens[breakpoint] !== nextScreens[breakpoint],
  );

  if (hasChanged) {
    currentScreens = nextScreens;
  }

  return currentScreens;
}

function subscribe(onStoreChange: () => void) {
  const queries = getMediaQueries();

  if (!Object.keys(queries).length) {
    return () => {};
  }

  const handler = () => onStoreChange();

  gridBreakpoints.forEach((breakpoint) => {
    const query = queries[breakpoint];

    if (query?.addEventListener) {
      query.addEventListener("change", handler);
    } else {
      query?.addListener?.(handler);
    }
  });

  return () => {
    gridBreakpoints.forEach((breakpoint) => {
      const query = queries[breakpoint];

      if (query?.removeEventListener) {
        query.removeEventListener("change", handler);
      } else {
        query?.removeListener?.(handler);
      }
    });
  };
}

export function useBreakpoint(
  fallbackScreens?: BreakpointScreenInput,
): BreakpointScreenMap {
  const fallback = useMemo(
    () => normalizeScreens(fallbackScreens),
    [fallbackScreens],
  );

  return useSyncExternalStore(
    subscribe,
    canUseMatchMedia() ? getCurrentScreens : () => fallback,
    () => fallback,
  );
}

export function useWatch(breakpoint: Breakpoint): boolean;
export function useWatch<T>(selector: (screens: BreakpointScreenMap) => T): T;
export function useWatch<T>(
  breakpointOrSelector: Breakpoint | ((screens: BreakpointScreenMap) => T),
) {
  const screens = useBreakpoint();

  if (typeof breakpointOrSelector === "function") {
    return breakpointOrSelector(screens);
  }

  return screens[breakpointOrSelector];
}

export const Grid = {
  useBreakpoint,
  useWatch,
} as const;
