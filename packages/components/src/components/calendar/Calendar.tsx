import React, { forwardRef, useMemo, useState } from "react";
import {
  calendarBodyClass,
  calendarCellContentClass,
  calendarControlsClass,
  calendarDateGridClass,
  calendarHeaderClass,
  calendarModeClass,
  calendarMonthGridClass,
  calendarNavClass,
  calendarTitleClass,
  calendarWeekdayClass,
  calendarWeekdaysClass,
  getCalendarCellClasses,
  getCalendarClasses,
} from "../../classes/calendar";
import type {
  CalendarComponent,
  CalendarInfo,
  CalendarMode,
  CalendarProps,
  CalendarValue,
} from "./Calendar.types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatMonth(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}

function parseDate(value: CalendarValue | undefined): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value === "string" && value.length > 0) {
    const [year, month = "1", day = "1"] = value.split("-");
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date: Date, amount: number) {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

function startOfCalendarGrid(panelDate: Date) {
  const firstOfMonth = new Date(panelDate.getFullYear(), panelDate.getMonth(), 1);
  const start = new Date(firstOfMonth);
  start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
  return start;
}

function buildDateGrid(panelDate: Date) {
  const start = startOfCalendarGrid(panelDate);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  );
}

function isOutsideRange(date: Date, validRange?: [CalendarValue, CalendarValue]) {
  if (!validRange) {
    return false;
  }

  const current = formatDate(date);
  const start = formatDate(parseDate(validRange[0]));
  const end = formatDate(parseDate(validRange[1]));

  return current < start || current > end;
}

function Header({
  panelDate,
  mode,
  setPanelDate,
  setMode,
}: {
  panelDate: Date;
  mode: CalendarMode;
  setPanelDate: (value: Date, sourceMode?: CalendarMode) => void;
  setMode: (value: CalendarMode) => void;
}) {
  const title =
    mode === "year"
      ? String(panelDate.getFullYear())
      : `${MONTHS[panelDate.getMonth()]} ${panelDate.getFullYear()}`;

  return (
    <div className={calendarHeaderClass}>
      <div className={calendarTitleClass}>{title}</div>
      <div className={calendarControlsClass}>
        <div className={calendarNavClass}>
          <button
            type="button"
            aria-label="Previous panel"
            onClick={() =>
              setPanelDate(
                mode === "year" ? addYears(panelDate, -1) : addMonths(panelDate, -1),
                mode,
              )
            }
          >
            Previous
          </button>
          <button
            type="button"
            aria-label="Next panel"
            onClick={() =>
              setPanelDate(
                mode === "year" ? addYears(panelDate, 1) : addMonths(panelDate, 1),
                mode,
              )
            }
          >
            Next
          </button>
        </div>
        <div className={calendarModeClass}>
          <button
            type="button"
            aria-pressed={mode === "month"}
            onClick={() => setMode("month")}
          >
            Month
          </button>
          <button
            type="button"
            aria-pressed={mode === "year"}
            onClick={() => setMode("year")}
          >
            Year
          </button>
        </div>
      </div>
    </div>
  );
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      className,
      value,
      defaultValue,
      mode,
      defaultMode = "month",
      fullscreen = true,
      validRange,
      disabledDate,
      dateCellRender,
      dateFullCellRender,
      monthCellRender,
      monthFullCellRender,
      cellRender,
      fullCellRender,
      headerRender,
      onChange,
      onSelect,
      onPanelChange,
      ...props
    },
    ref,
  ) => {
    const selectedDate = parseDate(value ?? defaultValue);
    const [innerValue, setInnerValue] = useState(() => formatDate(selectedDate));
    const [panelDate, setInnerPanelDate] = useState(selectedDate);
    const [innerMode, setInnerMode] = useState<CalendarMode>(mode ?? defaultMode);
    const currentMode = mode ?? innerMode;
    const currentValue = value === undefined ? innerValue : formatDate(parseDate(value));
    const today = useMemo(() => formatDate(new Date()), []);
    const dateGrid = useMemo(() => buildDateGrid(panelDate), [panelDate]);

    function emitPanelChange(nextDate: Date, nextMode = currentMode) {
      setInnerPanelDate(nextDate);
      onPanelChange?.(formatDate(nextDate), nextMode);
    }

    function setCalendarMode(nextMode: CalendarMode) {
      if (mode === undefined) {
        setInnerMode(nextMode);
      }

      onPanelChange?.(formatDate(panelDate), nextMode);
    }

    function commitValue(nextDate: Date, source: "date" | "month") {
      const nextValue = source === "month" ? formatMonth(nextDate) : formatDate(nextDate);

      if (disabledDate?.(nextValue) || isOutsideRange(nextDate, validRange)) {
        return;
      }

      if (value === undefined) {
        setInnerValue(nextValue);
      }

      setInnerPanelDate(nextDate);
      onSelect?.(nextValue, { source });
      onChange?.(nextValue);
    }

    function renderDateCell(date: Date) {
      const dateValue = formatDate(date);
      const originNode = (
        <div className={calendarCellContentClass}>
          <span>{date.getDate()}</span>
          {dateCellRender?.(dateValue)}
        </div>
      );
      const info: CalendarInfo = {
        originNode,
        today,
        type: "month",
      };
      const content =
        fullCellRender?.(dateValue, info) ??
        dateFullCellRender?.(dateValue) ??
        cellRender?.(dateValue, info) ??
        originNode;
      const disabled = disabledDate?.(dateValue) || isOutsideRange(date, validRange);

      return (
        <button
          key={dateValue}
          type="button"
          aria-label={dateValue}
          disabled={disabled}
          className={getCalendarCellClasses({
            selected: dateValue === currentValue,
            today: dateValue === today,
            outside: !isSameMonth(date, panelDate),
            disabled,
          })}
          onClick={() => commitValue(date, "date")}
        >
          {content}
        </button>
      );
    }

    function renderMonthCell(month: number) {
      const date = new Date(panelDate.getFullYear(), month, 1);
      const dateValue = formatMonth(date);
      const originNode = (
        <div className={calendarCellContentClass}>
          <span>{MONTHS[month]}</span>
          {monthCellRender?.(dateValue)}
        </div>
      );
      const info: CalendarInfo = {
        originNode,
        today,
        type: "year",
      };
      const content =
        fullCellRender?.(dateValue, info) ??
        monthFullCellRender?.(dateValue) ??
        cellRender?.(dateValue, info) ??
        originNode;
      const disabled = disabledDate?.(dateValue) || isOutsideRange(date, validRange);

      return (
        <button
          key={dateValue}
          type="button"
          aria-label={dateValue}
          disabled={disabled}
          className={getCalendarCellClasses({
            selected: dateValue === formatMonth(parseDate(currentValue)),
            today: dateValue === formatMonth(new Date()),
            disabled,
          })}
          onClick={() => commitValue(date, "month")}
        >
          {content}
        </button>
      );
    }

    return (
      <div
        {...props}
        ref={ref}
        className={getCalendarClasses({
          fullscreen,
          mode: currentMode,
          className,
        })}
      >
        {headerRender ? (
          headerRender({
            value: formatDate(panelDate),
            type: currentMode,
            onChange: (nextValue) => emitPanelChange(parseDate(nextValue)),
            onTypeChange: setCalendarMode,
          })
        ) : (
          <Header
            panelDate={panelDate}
            mode={currentMode}
            setPanelDate={emitPanelChange}
            setMode={setCalendarMode}
          />
        )}
        <div className={calendarBodyClass}>
          {currentMode === "month" ? (
            <>
              <div className={calendarWeekdaysClass} aria-hidden="true">
                {WEEKDAYS.map((weekday) => (
                  <span key={weekday} className={calendarWeekdayClass}>
                    {weekday}
                  </span>
                ))}
              </div>
              <div className={calendarDateGridClass}>
                {dateGrid.map(renderDateCell)}
              </div>
            </>
          ) : (
            <div className={calendarMonthGridClass}>
              {MONTHS.map((_, month) => renderMonthCell(month))}
            </div>
          )}
        </div>
      </div>
    );
  },
) as CalendarComponent;

Calendar.displayName = "Calendar";
