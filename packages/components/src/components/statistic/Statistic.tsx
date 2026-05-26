import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getStatisticClasses,
  statisticContentClass,
  statisticPrefixClass,
  statisticSuffixClass,
  statisticTitleClass,
  statisticValueClass,
} from "../../classes/statistic";
import type {
  CountdownProps,
  CountdownValue,
  StatisticComponent,
  StatisticProps,
  StatisticValue,
} from "./Statistic.types";

function formatStatisticValue(
  value: StatisticValue | undefined,
  precision?: number,
) {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "number" && precision !== undefined) {
    return value.toFixed(precision);
  }

  return value;
}

function toTimestamp(value: CountdownValue) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function pad(value: number, size = 2) {
  return String(value).padStart(size, "0");
}

function formatCountdown(remaining: number, format = "HH:mm:ss") {
  const totalMilliseconds = Math.max(0, remaining);
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = totalMilliseconds % 1000;

  return format
    .replace(/DD/g, pad(days))
    .replace(/D/g, String(days))
    .replace(/HH/g, pad(hours))
    .replace(/H/g, String(hours))
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, String(seconds))
    .replace(/SSS/g, pad(milliseconds, 3));
}

function StatisticBase({
  title,
  value,
  precision,
  prefix,
  suffix,
  formatter,
  valueStyle,
  className,
  ref,
  ...props
}: StatisticProps) {
  const renderedValue = formatter
    ? formatter(value)
    : formatStatisticValue(value, precision);

  return (
    <div ref={ref} className={getStatisticClasses({ className })} {...props}>
      {title !== undefined && (
        <div className={statisticTitleClass}>{title}</div>
      )}
      <div className={statisticContentClass}>
        {prefix !== undefined && (
          <span className={statisticPrefixClass}>{prefix}</span>
        )}
        <span className={statisticValueClass} style={valueStyle}>
          {renderedValue}
        </span>
        {suffix !== undefined && (
          <span className={statisticSuffixClass}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Countdown({
  value,
  format = "HH:mm:ss",
  onFinish,
  onChange,
  ...props
}: CountdownProps) {
  const target = useMemo(() => toTimestamp(value), [value]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - Date.now()),
  );
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;

    const tick = () => {
      const nextRemaining = Math.max(0, target - Date.now());
      setRemaining(nextRemaining);
      onChange?.(nextRemaining);

      if (nextRemaining <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        onFinish?.();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);

    return () => window.clearInterval(interval);
  }, [target, onChange, onFinish]);

  return (
    <StatisticBase {...props} value={formatCountdown(remaining, format)} />
  );
}

export const Statistic = StatisticBase as StatisticComponent;
Statistic.Countdown = Countdown;
