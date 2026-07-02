import { cn } from "../utils";
import type {
  TimelineColor,
  TimelineMode,
  TimelineSize,
} from "../components/timeline/Timeline.types";

export const timelineBaseClass = "timeline";
export const timelineItemClass = "timeline-item";
export const timelineMarkerBaseClass = "timeline-marker";
export const timelineMarkerIconClass = "timeline-marker-icon";
export const timelineContentClass = "timeline-content";
export const timelineTimeClass = "timeline-time";
export const timelinePendingClass = "timeline-item-pending";

export const timelineModeClasses: Record<TimelineMode, string> = {
  left: "",
  right: "timeline-right",
  alternate: "timeline-alternate",
};

export const timelineSizeClasses: Record<TimelineSize, string> = {
  sm: "timeline-sm",
  md: "",
  lg: "timeline-lg",
};

export const timelineMarkerColorClasses: Record<TimelineColor, string> = {
  primary: "timeline-marker-primary",
  secondary: "timeline-marker-secondary",
  tertiary: "timeline-marker-tertiary",
  accent: "timeline-marker-accent",
  neutral: "timeline-marker-neutral",
  base: "timeline-marker-base",
  info: "timeline-marker-info",
  success: "timeline-marker-success",
  warning: "timeline-marker-warning",
  error: "timeline-marker-error",
};

export function getTimelineClasses({
  mode = "left",
  size = "md",
  className,
}: {
  mode?: TimelineMode;
  size?: TimelineSize;
  className?: string;
}) {
  return cn(
    timelineBaseClass,
    timelineModeClasses[mode],
    timelineSizeClasses[size],
    className,
  );
}

export function getTimelineMarkerClasses({
  color = "primary",
  hasIcon,
}: {
  color?: TimelineColor;
  hasIcon?: boolean;
}) {
  return cn(
    timelineMarkerBaseClass,
    timelineMarkerColorClasses[color],
    hasIcon && timelineMarkerIconClass,
  );
}
