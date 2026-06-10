import React, { forwardRef, useEffect, useRef, useState } from "react";
import { getBackTopClasses } from "../../classes/back-top";
import type { BackTopProps } from "./BackTop.types";

function getTarget(target?: BackTopProps["target"]) {
  if (typeof window === "undefined") return null;
  return target?.() ?? window;
}

function getTop(target: Window | HTMLElement | null) {
  if (!target) return 0;
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

function scrollToTop(target: Window | HTMLElement | null) {
  if (!target) return;
  if (target instanceof Window) {
    target.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    target.scrollTo({ top: 0, behavior: "smooth" });
  }
}

export const BackTop = forwardRef<HTMLButtonElement, BackTopProps>(
  (
    {
      visibilityHeight = 400,
      target,
      children,
      className,
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;

    useEffect(() => {
      const scrollTarget = getTarget(target);
      if (!scrollTarget) return undefined;

      function updateVisible() {
        const nextVisible = getTop(scrollTarget) >= visibilityHeight;
        if (nextVisible !== visibleRef.current) {
          visibleRef.current = nextVisible;
          setVisible(nextVisible);
        }
      }

      updateVisible();
      scrollTarget.addEventListener("scroll", updateVisible);
      return () => scrollTarget.removeEventListener("scroll", updateVisible);
    }, [target, visibilityHeight]);

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={getBackTopClasses({ visible, className })}
        hidden={!visible}
        aria-label={props["aria-label"] ?? "Back to top"}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            scrollToTop(getTarget(target));
          }
        }}
      >
        {children ?? "Top"}
      </button>
    );
  },
);

BackTop.displayName = "BackTop";
