import { cn } from "../utils";
import type {
  StepsDirection,
  StepsStatus,
} from "../components/steps/Steps.types";

export const stepsBaseClass = "stepper";
export const stepsVerticalClass = "stepper-vertical";
export const stepsAltLabelsClass = "stepper-alt-labels";
export const stepsProgressDotClass = "stepper-progress-dot";
export const stepsWithPercentClass = "stepper-with-percent";

export const stepsStepClass = "stepper-step";
export const stepsStepButtonClass = "stepper-step-button";
export const stepsStepIconClass = "stepper-step-icon";
export const stepsStepLabelClass = "stepper-step-label";
export const stepsStepDescriptionClass = "stepper-step-description";
export const stepsStepConnectorClass = "stepper-step-connector";
export const stepsStepBodyClass = "stepper-step-body";
export const stepsStepSubtitleClass = "stepper-step-subtitle";
export const stepsStepClickableClass = "stepper-step-clickable";
export const stepsStepDotClass = "stepper-step-dot";
export const stepsStepPercentClass = "stepper-step-percent";
export const stepsStepProgressClass = "stepper-step-progress";

export const stepsDirectionClasses: Record<StepsDirection, string> = {
  horizontal: "",
  vertical: stepsVerticalClass,
};

export const stepsStatusClasses: Record<StepsStatus, string> = {
  wait: "stepper-step-wait",
  process: "stepper-step-active",
  finish: "stepper-step-completed",
  error: "stepper-step-error",
};

export function getStepsClasses({
  direction = "horizontal",
  progressDot,
  percent,
  className,
}: {
  direction?: StepsDirection;
  progressDot?: boolean;
  percent?: number;
  className?: string;
}) {
  return cn(
    stepsBaseClass,
    stepsDirectionClasses[direction],
    progressDot && stepsAltLabelsClass,
    progressDot && stepsProgressDotClass,
    percent !== undefined && stepsWithPercentClass,
    className,
  );
}

export function getStepsStepClasses({
  status,
  disabled,
  clickable,
  className,
}: {
  status: StepsStatus;
  disabled?: boolean;
  clickable?: boolean;
  className?: string;
}) {
  return cn(
    stepsStepClass,
    stepsStatusClasses[status],
    disabled && "stepper-step-disabled",
    clickable && stepsStepClickableClass,
    className,
  );
}

export function getStepsStepIconClasses({
  progressDot,
  percent,
}: {
  progressDot?: boolean;
  percent?: boolean;
}) {
  return cn(
    stepsStepIconClass,
    progressDot && stepsStepDotClass,
    percent && stepsStepProgressClass,
  );
}
