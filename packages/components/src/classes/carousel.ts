import type {
  CarouselDotPosition,
  CarouselEffect,
} from "../components/carousel/Carousel.types";
import { cn } from "../utils";

export const carouselBaseClass = "carousel";
export const carouselTrackClass = "carousel-track";
export const carouselSlideClass = "carousel-slide";
export const carouselSlideActiveClass = "carousel-slide-active";
export const carouselArrowClass = "carousel-arrow";
export const carouselPrevClass = "carousel-prev";
export const carouselNextClass = "carousel-next";
export const carouselDotsClass = "carousel-dots";
export const carouselDotClass = "carousel-dot";
export const carouselDotActiveClass = "carousel-dot-active";

export const carouselEffectClasses: Record<CarouselEffect, string> = {
  scrollx: "carousel-scrollx",
  fade: "carousel-fade",
};

export const carouselDotPositionClasses: Record<CarouselDotPosition, string> = {
  top: "carousel-dots-top",
  bottom: "carousel-dots-bottom",
  left: "carousel-dots-left",
  right: "carousel-dots-right",
};

export function getCarouselClasses({
  effect,
  dotPosition,
  className,
}: {
  effect: CarouselEffect;
  dotPosition: CarouselDotPosition;
  className?: string;
}) {
  return cn(
    carouselBaseClass,
    carouselEffectClasses[effect],
    carouselDotPositionClasses[dotPosition],
    className,
  );
}

export function getCarouselSlideClasses({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return cn(carouselSlideClass, active && carouselSlideActiveClass, className);
}

export function getCarouselDotClasses({ active }: { active?: boolean }) {
  return cn(carouselDotClass, active && carouselDotActiveClass);
}
