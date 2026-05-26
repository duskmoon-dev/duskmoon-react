import React, { forwardRef } from "react";
import {
  getResultClasses,
  getResultPresentedIconClasses,
  normalizeResultStatus,
  resultExtraClass,
  resultIconClass,
  resultSubTitleClass,
  resultTitleClass,
} from "../../classes/result";
import type { ResultProps, ResultStatus } from "./Result.types";

const statusLabels: Record<ReturnType<typeof normalizeResultStatus>, string> = {
  success: "Success",
  error: "Error",
  info: "Info",
  warning: "Warning",
  "404": "Not found",
  "403": "Forbidden",
  "500": "Server error",
};

function PresentedIconGlyph({
  status,
}: {
  status: ReturnType<typeof normalizeResultStatus>;
}) {
  if (status === "404" || status === "403" || status === "500") {
    return <span aria-hidden="true">{status}</span>;
  }

  if (status === "success") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path
          d="M5 12.5l4.25 4.25L19 7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (status === "warning") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path
          d="M12 4l8 15H4L12 4z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M12 9v4M12 17h.01"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (status === "error") {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path
          d="M8 8l8 8M16 8l-8 8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="M12 11v6M12 7h.01"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function PresentedIcon({ status }: { status: ResultStatus }) {
  const normalizedStatus = normalizeResultStatus(status);

  return (
    <span
      className={getResultPresentedIconClasses(normalizedStatus)}
      aria-label={statusLabels[normalizedStatus]}
      role="img"
    >
      <PresentedIconGlyph status={normalizedStatus} />
    </span>
  );
}

export const Result = forwardRef<HTMLDivElement, ResultProps>(
  (
    {
      status = "info",
      title,
      subTitle,
      icon,
      extra,
      className,
      role = "status",
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      role={role}
      className={getResultClasses({ status, className })}
      {...props}
    >
      <div className={resultIconClass}>
        {icon ?? <PresentedIcon status={status} />}
      </div>
      {title ? <div className={resultTitleClass}>{title}</div> : null}
      {subTitle ? (
        <div className={resultSubTitleClass}>{subTitle}</div>
      ) : null}
      {extra ? <div className={resultExtraClass}>{extra}</div> : null}
    </div>
  ),
);

Result.displayName = "Result";
