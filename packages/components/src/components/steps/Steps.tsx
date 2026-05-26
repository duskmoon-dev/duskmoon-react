import React, { forwardRef } from "react";
import {
  getStepsClasses,
  getStepsStepClasses,
  getStepsStepIconClasses,
  stepsStepBodyClass,
  stepsStepButtonClass,
  stepsStepConnectorClass,
  stepsStepDescriptionClass,
  stepsStepLabelClass,
  stepsStepPercentClass,
  stepsStepSubtitleClass,
} from "../../classes/steps";
import type {
  StepItem,
  StepProps,
  StepsComponent,
  StepsProps,
  StepsStatus,
} from "./Steps.types";

function hasNode(node: React.ReactNode) {
  return node !== undefined && node !== null && node !== false;
}

function toInteger(value: number | undefined, fallback: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.floor(value);
}

function clampPercent(percent: number) {
  if (!Number.isFinite(percent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, percent));
}

export const Step = forwardRef<HTMLDivElement, StepProps>(() => null);

Step.displayName = "Steps.Step";

function isStepElement(
  child: React.ReactNode,
): child is React.ReactElement<StepProps> {
  return React.isValidElement<StepProps>(child) && child.type === Step;
}

function getStepItems(items?: StepItem[], children?: React.ReactNode) {
  if (items) {
    return items;
  }

  return React.Children.toArray(children).flatMap((child) => {
    if (!isStepElement(child)) {
      return [];
    }

    return [
      {
        ...child.props,
        key: child.key ?? undefined,
      },
    ];
  });
}

function getItemDescription(item: StepItem) {
  return item.description ?? item.content ?? item.children;
}

function getItemContent(item: StepItem) {
  return item.content ?? item.description ?? item.children;
}

function getStepStatus({
  item,
  index,
  current,
  currentStatus,
}: {
  item: StepItem;
  index: number;
  current: number;
  currentStatus: StepsStatus;
}): StepsStatus {
  if (item.status) {
    return item.status;
  }

  if (index < current) {
    return "finish";
  }

  if (index === current) {
    return currentStatus;
  }

  return "wait";
}

function renderProgressDot({
  progressDot,
  item,
  index,
  status,
}: {
  progressDot: Exclude<StepsProps["progressDot"], undefined | false>;
  item: StepItem;
  index: number;
  status: StepsStatus;
}) {
  const iconDot = <span className="stepper-step-dot-inner" />;

  if (typeof progressDot !== "function") {
    return iconDot;
  }

  return progressDot(iconDot, {
    index,
    status,
    title: item.title,
    description: getItemDescription(item),
    content: getItemContent(item),
  });
}

function renderStepIcon({
  item,
  index,
  initial,
  status,
  progressDot,
  percent,
}: {
  item: StepItem;
  index: number;
  initial: number;
  status: StepsStatus;
  progressDot?: StepsProps["progressDot"];
  percent?: number;
}) {
  const progressDotEnabled = Boolean(progressDot);
  const progressPercent =
    !progressDotEnabled && status === "process" && percent !== undefined
      ? clampPercent(percent)
      : undefined;
  const icon = progressDotEnabled
    ? renderProgressDot({
        progressDot: progressDot as Exclude<
          StepsProps["progressDot"],
          undefined | false
        >,
        item,
        index,
        status,
      })
    : (item.icon ?? (status === "finish" ? "✓" : initial + index + 1));

  return (
    <span
      className={getStepsStepIconClasses({
        progressDot: progressDotEnabled,
        percent: progressPercent !== undefined,
      })}
      aria-hidden={progressPercent === undefined ? "true" : undefined}
    >
      {progressPercent !== undefined ? (
        <span
          className={stepsStepPercentClass}
          role="progressbar"
          aria-label={`Step ${index + 1} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          style={
            {
              "--steps-percent": `${progressPercent}%`,
            } as React.CSSProperties
          }
        >
          {icon}
        </span>
      ) : (
        icon
      )}
    </span>
  );
}

function renderStepContent(item: StepItem) {
  const description = getItemDescription(item);

  return (
    <span className={stepsStepBodyClass}>
      {hasNode(item.title) || hasNode(item.subTitle) ? (
        <span className={stepsStepLabelClass}>
          {item.title}
          {hasNode(item.subTitle) ? (
            <span className={stepsStepSubtitleClass}>{item.subTitle}</span>
          ) : null}
        </span>
      ) : null}
      {hasNode(description) ? (
        <span className={stepsStepDescriptionClass}>{description}</span>
      ) : null}
    </span>
  );
}

const StepsRoot = forwardRef<HTMLDivElement, StepsProps>(
  (
    {
      items,
      children,
      current,
      status = "process",
      direction = "horizontal",
      progressDot,
      percent,
      initial,
      onChange,
      className,
      role,
      ...props
    },
    ref,
  ) => {
    const stepItems = getStepItems(items, children);
    const mergedCurrent = toInteger(current, 0);
    const initialOffset = toInteger(initial, 0);
    const progressDotEnabled = Boolean(progressDot);

    return (
      <div
        {...props}
        ref={ref}
        role={role ?? "list"}
        className={getStepsClasses({
          direction,
          progressDot: progressDotEnabled,
          percent,
          className,
        })}
      >
        {stepItems.map((item, index) => {
          const stepStatus = getStepStatus({
            item,
            index,
            current: mergedCurrent,
            currentStatus: status,
          });
          const clickable = Boolean(onChange) && !item.disabled;
          const content = (
            <>
              {renderStepIcon({
                item,
                index,
                initial: initialOffset,
                status: stepStatus,
                progressDot,
                percent: index === mergedCurrent ? percent : undefined,
              })}
              {renderStepContent(item)}
            </>
          );

          return (
            <div
              key={item.key ?? index}
              role="listitem"
              aria-current={index === mergedCurrent ? "step" : undefined}
              className={getStepsStepClasses({
                status: stepStatus,
                disabled: item.disabled,
                clickable,
                className: item.className,
              })}
              style={item.style}
            >
              {onChange ? (
                <button
                  type="button"
                  className={stepsStepButtonClass}
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      onChange(index);
                    }
                  }}
                >
                  {content}
                </button>
              ) : (
                <div className={stepsStepButtonClass}>{content}</div>
              )}
              <span className={stepsStepConnectorClass} aria-hidden="true" />
            </div>
          );
        })}
      </div>
    );
  },
);

StepsRoot.displayName = "Steps";

export const Steps = Object.assign(StepsRoot, {
  Step,
}) as StepsComponent;
