import React, {
  forwardRef,
  useEffect,
  useId,
  useState,
  type CSSProperties,
} from "react";
import {
  getTourIndicatorClasses,
  getTourMaskClasses,
  getTourPanelClasses,
  getTourRootClasses,
  tourActionsClass,
  tourArrowClass,
  tourBodyClass,
  tourCloseClass,
  tourCoverClass,
  tourFooterClass,
  tourHeaderClass,
  tourIndicatorsClass,
  tourTargetClass,
  tourTitleClass,
} from "../../classes/tour";
import { Button } from "../button";
import type {
  TourMaskConfig,
  TourPlacement,
  TourProps,
  TourStep,
  TourTarget,
  TourTargetRect,
} from "./Tour.types";

const defaultCloseIcon = "x";
const fallbackRect: TourTargetRect = {
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};

function clampCurrent(current: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(current, total - 1));
}

function resolveTarget(target: TourTarget | undefined) {
  if (typeof document === "undefined" || target === null) return null;
  if (typeof target === "function") return target();
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  return target ?? null;
}

function getTargetRect(target: HTMLElement | null): TourTargetRect {
  if (!target) return fallbackRect;
  const rect = target.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function isMaskConfig(mask: TourProps["mask"]): mask is TourMaskConfig {
  return typeof mask === "object" && mask !== null;
}

function getMaskConfig(
  mask: TourStep["mask"] | TourProps["mask"],
): TourMaskConfig | undefined {
  return isMaskConfig(mask) ? mask : undefined;
}

function getPanelStyle({
  gap,
  placement,
  rect,
  style,
}: {
  gap: number;
  placement: TourPlacement;
  rect: TourTargetRect;
  style?: CSSProperties;
}): CSSProperties {
  const hasTarget = rect.width > 0 || rect.height > 0;

  if (!hasTarget) {
    return {
      position: "fixed",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      ...style,
    };
  }

  const verticalCenter = rect.top + rect.height / 2;
  const horizontalCenter = rect.left + rect.width / 2;
  const base: CSSProperties = { position: "fixed", ...style };

  if (placement.startsWith("top")) {
    return {
      ...base,
      left: placement === "topLeft" ? rect.left : horizontalCenter,
      top: rect.top - gap,
      transform: placement === "topLeft" ? "translateY(-100%)" : "translate(-50%, -100%)",
    };
  }

  if (placement.startsWith("left")) {
    return {
      ...base,
      left: rect.left - gap,
      top: placement === "leftTop" ? rect.top : verticalCenter,
      transform: placement === "leftTop" ? "translateX(-100%)" : "translate(-100%, -50%)",
    };
  }

  if (placement.startsWith("right")) {
    return {
      ...base,
      left: rect.left + rect.width + gap,
      top: placement === "rightTop" ? rect.top : verticalCenter,
      transform: placement === "rightTop" ? undefined : "translateY(-50%)",
    };
  }

  return {
    ...base,
    left: placement === "bottomLeft" ? rect.left : horizontalCenter,
    top: rect.top + rect.height + gap,
    transform: placement === "bottomLeft" ? undefined : "translateX(-50%)",
  };
}

function getHighlightStyle(rect: TourTargetRect, gap: number): CSSProperties {
  return {
    position: "fixed",
    left: rect.left - gap / 2,
    top: rect.top - gap / 2,
    width: rect.width + gap,
    height: rect.height + gap,
  };
}

function mergeButtonProps(
  rootProps: TourProps["nextButtonProps"],
  stepProps: TourStep["nextButtonProps"],
) {
  return { ...rootProps, ...stepProps };
}

export const Tour = forwardRef<HTMLDivElement, TourProps>(
  (
    {
      steps = [],
      open,
      defaultOpen = false,
      current,
      defaultCurrent = 0,
      placement = "bottom",
      mask = true,
      indicators = true,
      indicatorsRender,
      closeIcon = defaultCloseIcon,
      disabledInteraction = false,
      zIndex,
      gap = 12,
      nextButtonProps,
      prevButtonProps,
      className,
      style,
      onClose,
      onChange,
      onFinish,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [internalCurrent, setInternalCurrent] = useState(defaultCurrent);
    const controlledOpen = open !== undefined;
    const controlledCurrent = current !== undefined;
    const visible = controlledOpen ? open : internalOpen;
    const mergedCurrent = clampCurrent(
      controlledCurrent ? current : internalCurrent,
      steps.length,
    );
    const step = steps[mergedCurrent];
    const mergedPlacement = step?.placement ?? placement;
    const mergedMask = step?.mask ?? mask;
    const maskConfig = getMaskConfig(mergedMask);
    const hasMask = mergedMask !== false;
    const [targetRect, setTargetRect] = useState<TourTargetRect>(fallbackRect);

    useEffect(() => {
      if (!visible) return;
      const target = resolveTarget(step?.target);
      setTargetRect(getTargetRect(target));
    }, [step?.target, visible]);

    if (!visible || !step) {
      return null;
    }

    const titleId = `${rootId}-title`;
    const descriptionId = `${rootId}-description`;
    const lastStep = mergedCurrent >= steps.length - 1;
    const showHighlight = hasMask && (targetRect.width > 0 || targetRect.height > 0);
    const rootStyle = { ...style, ...(zIndex !== undefined ? { zIndex } : undefined) };
    const currentCloseIcon = step.closeIcon ?? closeIcon;
    const currentNextButtonProps = mergeButtonProps(
      nextButtonProps,
      step.nextButtonProps,
    );
    const currentPrevButtonProps = mergeButtonProps(
      prevButtonProps,
      step.prevButtonProps,
    );

    function setVisible(nextOpen: boolean) {
      if (!controlledOpen) {
        setInternalOpen(nextOpen);
      }
    }

    function setStep(nextCurrent: number) {
      const normalized = clampCurrent(nextCurrent, steps.length);

      if (!controlledCurrent) {
        setInternalCurrent(normalized);
      }

      onChange?.(normalized);
    }

    function close() {
      step.onClose?.(mergedCurrent);
      onClose?.(mergedCurrent);
      setVisible(false);
    }

    function next() {
      if (lastStep) {
        onFinish?.();
        close();
        return;
      }

      setStep(mergedCurrent + 1);
    }

    function previous() {
      setStep(mergedCurrent - 1);
    }

    function renderIndicators() {
      if (indicators === false) return null;
      if (typeof indicators === "function") {
        return indicators(mergedCurrent, steps.length);
      }
      if (indicatorsRender) {
        return indicatorsRender(mergedCurrent, steps.length);
      }

      return (
        <div className={tourIndicatorsClass} aria-label="Tour steps">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={getTourIndicatorClasses({
                active: index === mergedCurrent,
              })}
              aria-label={`Go to step ${index + 1}`}
              aria-current={index === mergedCurrent ? "step" : undefined}
              onClick={() => setStep(index)}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        className={getTourRootClasses({ open: visible, className })}
        style={rootStyle}
      >
        {hasMask ? (
          <div
            className={getTourMaskClasses({
              visible: true,
              className: maskConfig?.className,
            })}
            style={{
              backgroundColor: maskConfig?.color,
              ...maskConfig?.style,
            }}
            aria-hidden="true"
          />
        ) : null}
        {showHighlight ? (
          <div
            className={tourTargetClass}
            style={getHighlightStyle(targetRect, gap)}
            aria-hidden="true"
          />
        ) : null}
        <div
          role="dialog"
          aria-modal={hasMask ? true : undefined}
          aria-labelledby={step.title ? titleId : undefined}
          aria-describedby={step.description ? descriptionId : undefined}
          className={getTourPanelClasses({
            placement: mergedPlacement,
            className: step.className,
          })}
          style={getPanelStyle({
            gap,
            placement: mergedPlacement,
            rect: targetRect,
            style: step.style,
          })}
        >
          {disabledInteraction ? <div aria-hidden="true" /> : null}
          <div className={tourHeaderClass}>
            {step.title ? (
              <h2 id={titleId} className={tourTitleClass}>
                {step.title}
              </h2>
            ) : null}
            {currentCloseIcon !== null && currentCloseIcon !== false ? (
              <button
                type="button"
                className={tourCloseClass}
                aria-label="Close tour"
                onClick={close}
              >
                {currentCloseIcon}
              </button>
            ) : null}
          </div>
          {step.cover ? <div className={tourCoverClass}>{step.cover}</div> : null}
          {step.description ? (
            <div id={descriptionId} className={tourBodyClass}>
              {step.description}
            </div>
          ) : null}
          <div className={tourFooterClass}>
            {renderIndicators()}
            <div className={tourActionsClass}>
              {mergedCurrent > 0 ? (
                <Button
                  appearance="text"
                  color="secondary"
                  size="sm"
                  {...currentPrevButtonProps}
                  onClick={(event) => {
                    currentPrevButtonProps?.onClick?.(event);
                    if (!event.defaultPrevented) previous();
                  }}
                >
                  {currentPrevButtonProps?.children ?? "Previous"}
                </Button>
              ) : null}
              <Button
                color="primary"
                size="sm"
                {...currentNextButtonProps}
                onClick={(event) => {
                  currentNextButtonProps?.onClick?.(event);
                  if (!event.defaultPrevented) next();
                }}
              >
                {currentNextButtonProps?.children ?? (lastStep ? "Finish" : "Next")}
              </Button>
            </div>
          </div>
          <span className={tourArrowClass} aria-hidden="true" />
        </div>
      </div>
    );
  },
);

Tour.displayName = "Tour";
