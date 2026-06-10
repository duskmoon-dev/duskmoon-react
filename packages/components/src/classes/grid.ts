export const gridBreakpoints = ["xs", "sm", "md", "lg", "xl", "xxl"] as const;

export const gridBreakpointQueries = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)",
} as const;
