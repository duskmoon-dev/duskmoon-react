import { cn } from "../utils";
import type {
  ResultNormalizedStatus,
  ResultStatus,
} from "../components/result/Result.types";

export const resultBaseClass = "result";
export const resultIconClass = "result-icon";
export const resultTitleClass = "result-title";
export const resultSubTitleClass = "result-subtitle";
export const resultExtraClass = "result-extra";
export const resultPresentedIconClass = "result-presented-icon";

export const resultStatusClasses: Record<ResultNormalizedStatus, string> = {
  success: "result-success",
  error: "result-error",
  info: "result-info",
  warning: "result-warning",
  "404": "result-404",
  "403": "result-403",
  "500": "result-500",
};

export const resultPresentedIconClasses: Record<
  ResultNormalizedStatus,
  string
> = {
  success: "result-presented-icon-success",
  error: "result-presented-icon-error",
  info: "result-presented-icon-info",
  warning: "result-presented-icon-warning",
  "404": "result-presented-icon-404",
  "403": "result-presented-icon-403",
  "500": "result-presented-icon-500",
};

export function normalizeResultStatus(
  status: ResultStatus = "info",
): ResultNormalizedStatus {
  return String(status) as ResultNormalizedStatus;
}

export function getResultClasses({
  status = "info",
  className,
}: {
  status?: ResultStatus;
  className?: string;
}) {
  const normalizedStatus = normalizeResultStatus(status);

  return cn(resultBaseClass, resultStatusClasses[normalizedStatus], className);
}

export function getResultPresentedIconClasses(status: ResultStatus = "info") {
  const normalizedStatus = normalizeResultStatus(status);

  return cn(
    resultPresentedIconClass,
    resultPresentedIconClasses[normalizedStatus],
  );
}
