import React, { forwardRef, useEffect, useRef, useState } from "react";
import { getAffixClasses } from "../../classes/affix";
import type { AffixProps } from "./Affix.types";

function getScrollTarget(target?: AffixProps["target"]) {
  if (typeof window === "undefined") return null;
  return target?.() ?? window;
}

function getScrollTop(target: Window | HTMLElement | null) {
  if (!target) return 0;
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

export const Affix = forwardRef<HTMLDivElement, AffixProps>(
  (
    {
      offsetTop,
      offsetBottom,
      target,
      onChange,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const [fixed, setFixed] = useState(false);
    const fixedRef = useRef(fixed);
    fixedRef.current = fixed;

    useEffect(() => {
      const scrollTarget = getScrollTarget(target);
      if (!scrollTarget) return undefined;

      function updateFixed() {
        const scrollTop = getScrollTop(scrollTarget);
        const nextFixed =
          offsetBottom !== undefined
            ? scrollTop > offsetBottom
            : scrollTop > (offsetTop ?? 0);

        if (nextFixed !== fixedRef.current) {
          fixedRef.current = nextFixed;
          setFixed(nextFixed);
          onChange?.(nextFixed);
        }
      }

      updateFixed();
      scrollTarget.addEventListener("scroll", updateFixed);
      window.addEventListener("resize", updateFixed);

      return () => {
        scrollTarget.removeEventListener("scroll", updateFixed);
        window.removeEventListener("resize", updateFixed);
      };
    }, [offsetBottom, offsetTop, onChange, target]);

    return (
      <div
        {...props}
        ref={ref}
        className={getAffixClasses({ fixed, className })}
        style={{
          position: fixed ? "fixed" : undefined,
          top:
            fixed && offsetBottom === undefined ? (offsetTop ?? 0) : undefined,
          bottom:
            fixed && offsetBottom !== undefined ? offsetBottom : undefined,
          ...style,
        }}
      >
        {children}
      </div>
    );
  },
);

Affix.displayName = "Affix";
