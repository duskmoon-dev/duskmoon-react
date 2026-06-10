import React, {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  carouselArrowClass,
  carouselDotsClass,
  carouselNextClass,
  carouselPrevClass,
  carouselTrackClass,
  getCarouselClasses,
  getCarouselDotClasses,
  getCarouselSlideClasses,
} from "../../classes/carousel";
import { cn } from "../../utils";
import type { CarouselComponent, CarouselProps } from "./Carousel.types";

function clampIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

export const Carousel = forwardRef(
  (
    {
      activeIndex,
      afterChange,
      arrows = false,
      autoplay = false,
      autoplaySpeed = 3000,
      beforeChange,
      children,
      className,
      defaultActiveIndex = 0,
      dots = true,
      dotPosition = "bottom",
      effect = "scrollx",
      onChange,
      speed = 500,
      ...props
    },
    ref,
  ) => {
    const slides = useMemo(() => Children.toArray(children), [children]);
    const count = slides.length;
    const controlled = activeIndex !== undefined;
    const [internalIndex, setInternalIndex] = useState(() =>
      clampIndex(defaultActiveIndex, count),
    );
    const currentIndex = clampIndex(
      controlled ? activeIndex : internalIndex,
      count,
    );

    function goTo(nextIndex: number) {
      if (count === 0) return;

      const normalizedNext = clampIndex(nextIndex, count);
      if (normalizedNext === currentIndex) return;

      beforeChange?.(currentIndex, normalizedNext);

      if (!controlled) {
        setInternalIndex(normalizedNext);
      }

      onChange?.(normalizedNext, currentIndex);
      afterChange?.(normalizedNext);
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    useImperativeHandle(ref, () => ({ goTo, next, prev }));

    useEffect(() => {
      if (!autoplay || count <= 1) return undefined;

      const timer = window.setInterval(next, autoplaySpeed);
      return () => window.clearInterval(timer);
    }, [autoplay, autoplaySpeed, count, currentIndex]);

    const dotsConfig = typeof dots === "object" ? dots : {};
    const shouldRenderDots = Boolean(dots) && count > 1;

    return (
      <div
        {...props}
        className={getCarouselClasses({ effect, dotPosition, className })}
        data-active-index={currentIndex}
      >
        <div
          className={carouselTrackClass}
          style={{
            transform:
              effect === "scrollx"
                ? `translateX(-${currentIndex * 100}%)`
                : undefined,
            transitionDuration: `${speed}ms`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className={getCarouselSlideClasses({ active: index === currentIndex })}
              aria-hidden={index === currentIndex ? undefined : true}
              style={
                effect === "fade"
                  ? {
                      opacity: index === currentIndex ? 1 : 0,
                      transitionDuration: `${speed}ms`,
                    }
                  : undefined
              }
            >
              {slide}
            </div>
          ))}
        </div>
        {arrows && count > 1 ? (
          <>
            <button
              type="button"
              className={cn(carouselArrowClass, carouselPrevClass)}
              aria-label="Previous slide"
              onClick={prev}
            >
              ‹
            </button>
            <button
              type="button"
              className={cn(carouselArrowClass, carouselNextClass)}
              aria-label="Next slide"
              onClick={next}
            >
              ›
            </button>
          </>
        ) : null}
        {shouldRenderDots ? (
          <div className={cn(carouselDotsClass, dotsConfig.className)}>
            {slides.map((_slide, index) => (
              <button
                key={index}
                type="button"
                className={getCarouselDotClasses({ active: index === currentIndex })}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  },
) as CarouselComponent;

Carousel.displayName = "Carousel";
