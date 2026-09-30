import type {
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
} from "react";

export type CarouselEffect = "scrollx" | "fade";
export type CarouselDotPosition = "top" | "bottom" | "left" | "right";

export interface CarouselProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  children?: ReactNode;
  activeIndex?: number;
  defaultActiveIndex?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  arrows?: boolean;
  dots?: boolean | { className?: string };
  dotPosition?: CarouselDotPosition;
  effect?: CarouselEffect;
  speed?: number;
  beforeChange?: (from: number, to: number) => void;
  afterChange?: (current: number) => void;
  onChange?: (current: number, previous: number) => void;
}

export interface CarouselRef {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

export type CarouselComponent = ForwardRefExoticComponent<
  CarouselProps & RefAttributes<CarouselRef>
>;
