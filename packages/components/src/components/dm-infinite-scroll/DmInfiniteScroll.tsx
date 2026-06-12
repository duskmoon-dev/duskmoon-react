import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type UIEvent,
} from "react";
import {
  dmInfiniteScrollContentClass,
  dmInfiniteScrollEndClass,
  dmInfiniteScrollLoaderClass,
  getDmInfiniteScrollClasses,
} from "../../classes/dm-infinite-scroll";
import type { DmInfiniteScrollProps } from "./DmInfiniteScroll.types";

function reachedThreshold(
  element: HTMLDivElement,
  threshold: DmInfiniteScrollProps["scrollThreshold"],
  inverse?: boolean,
) {
  const scrollTop = Math.max(0, element.scrollTop);
  const clientHeight = element.clientHeight;
  const scrollHeight = element.scrollHeight;

  if (typeof threshold === "string" && threshold.trim().endsWith("px")) {
    const pixels = Number.parseFloat(threshold);
    if (!Number.isFinite(pixels)) {
      return false;
    }

    return inverse
      ? scrollTop <= pixels
      : scrollHeight - (scrollTop + clientHeight) <= pixels;
  }

  const ratio =
    typeof threshold === "number"
      ? threshold
      : Number.parseFloat(String(threshold));
  const normalized = Number.isFinite(ratio) ? ratio : 0.8;
  const scrolledRatio = inverse
    ? 1 - scrollTop / Math.max(1, scrollHeight - clientHeight)
    : (scrollTop + clientHeight) / Math.max(1, scrollHeight);

  return scrolledRatio >= normalized;
}

export const DmInfiniteScroll = forwardRef<
  HTMLDivElement,
  DmInfiniteScrollProps
>(
  (
    {
      id,
      prefix = "dm-scroll-container",
      children,
      dataLength,
      next,
      hasMore,
      loader = <span role="status">Loading...</span>,
      endMessage,
      scrollThreshold = 0.8,
      height,
      hasChildren,
      inverse = false,
      initialScrollY,
      className,
      style,
      onScroll,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previousLengthRef = useRef(dataLength);
    const [actionTriggered, setActionTriggered] = useState(false);
    const scrollableTarget = `${prefix}-${id}`;
    const hasVisibleChildren =
      hasChildren ??
      (Array.isArray(children) ? children.length > 0 : Boolean(children));

    useEffect(() => {
      if (previousLengthRef.current !== dataLength) {
        previousLengthRef.current = dataLength;
        setActionTriggered(false);
      }
    }, [dataLength]);

    useEffect(() => {
      if (initialScrollY !== undefined && containerRef.current) {
        containerRef.current.scrollTop = initialScrollY;
      }
    }, [initialScrollY]);

    function setRefs(node: HTMLDivElement | null) {
      containerRef.current = node;

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    function handleScroll(event: UIEvent<HTMLDivElement>) {
      onScroll?.(event);

      if (!hasMore || actionTriggered) {
        return;
      }

      if (reachedThreshold(event.currentTarget, scrollThreshold, inverse)) {
        setActionTriggered(true);
        void next();
      }
    }

    return (
      <div
        {...props}
        id={scrollableTarget}
        ref={setRefs}
        className={getDmInfiniteScrollClasses({ inverse, className })}
        style={{
          overflow: "auto",
          height,
          ...style,
        }}
        onScroll={handleScroll}
      >
        <div className={dmInfiniteScrollContentClass}>{children}</div>
        {hasMore && actionTriggered ? (
          <div className={dmInfiniteScrollLoaderClass}>{loader}</div>
        ) : null}
        {!hasMore && hasVisibleChildren && endMessage ? (
          <div className={dmInfiniteScrollEndClass}>{endMessage}</div>
        ) : null}
      </div>
    );
  },
);

DmInfiniteScroll.displayName = "DmInfiniteScroll";
