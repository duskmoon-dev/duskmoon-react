import React, { forwardRef } from "react";
import {
  getTimelineClasses,
  getTimelineMarkerClasses,
  timelineContentClass,
  timelineItemClass,
  timelinePendingClass,
  timelineTimeClass,
} from "../../classes/timeline";
import { cn } from "../../utils";
import type { TimelineItem, TimelineProps } from "./Timeline.types";

function buildItems({
  items,
  children,
  pending,
  reverse,
}: {
  items?: TimelineItem[];
  children?: React.ReactNode;
  pending?: React.ReactNode | boolean;
  reverse?: boolean;
}) {
  const timelineItems = items ? [...items] : [{ children }];

  if (pending) {
    timelineItems.push({
      children: pending === true ? "Loading..." : pending,
      pending: true,
    });
  }

  return reverse ? timelineItems.reverse() : timelineItems;
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      items,
      children,
      mode = "left",
      pending,
      reverse,
      size = "md",
      className,
      ...props
    },
    ref,
  ) => {
    const timelineItems = buildItems({ items, children, pending, reverse });

    return (
      <div
        {...props}
        ref={ref}
        className={getTimelineClasses({ mode, size, className })}
      >
        {timelineItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              timelineItemClass,
              item.pending && timelinePendingClass,
              item.className,
            )}
          >
            <span
              className={getTimelineMarkerClasses({
                color: item.color,
                hasIcon: Boolean(item.dot),
              })}
              aria-hidden="true"
            >
              {item.dot}
            </span>
            <div className={timelineContentClass}>
              {item.label ? (
                <span className={timelineTimeClass}>{item.label}</span>
              ) : null}
              {item.children}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

Timeline.displayName = "Timeline";
