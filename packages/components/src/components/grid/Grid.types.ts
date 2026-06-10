import type {
  gridBreakpointQueries,
  gridBreakpoints,
} from "../../classes/grid";

export type Breakpoint = (typeof gridBreakpoints)[number];

export type BreakpointQueryMap = typeof gridBreakpointQueries;

export type BreakpointScreenMap = Record<Breakpoint, boolean>;

export type BreakpointScreenInput = Partial<BreakpointScreenMap>;
