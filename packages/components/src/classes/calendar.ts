import type { CalendarMode } from "../components/calendar/Calendar.types";
import { cn } from "../utils";

export const calendarBaseClass = "datepicker calendar";
export const calendarHeaderClass = "calendar-header";
export const calendarTitleClass = "calendar-title";
export const calendarControlsClass = "calendar-controls";
export const calendarNavClass = "calendar-nav";
export const calendarModeClass = "calendar-mode";
export const calendarWeekdaysClass = "calendar-weekdays";
export const calendarWeekdayClass = "calendar-weekday";
export const calendarBodyClass = "calendar-body";
export const calendarDateGridClass = "calendar-date-grid";
export const calendarMonthGridClass = "calendar-month-grid";
export const calendarCellContentClass = "calendar-cell-content";

export function getCalendarClasses({
  fullscreen = true,
  mode = "month",
  className,
}: {
  fullscreen?: boolean;
  mode?: CalendarMode;
  className?: string;
}) {
  return cn(
    calendarBaseClass,
    fullscreen ? "calendar-fullscreen" : "calendar-card",
    mode === "year" && "calendar-year-mode",
    className,
  );
}

export function getCalendarCellClasses({
  selected,
  today,
  outside,
  disabled,
  className,
}: {
  selected?: boolean;
  today?: boolean;
  outside?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return cn(
    "calendar-cell",
    selected && "calendar-cell-selected",
    today && "calendar-cell-today",
    outside && "calendar-cell-outside",
    disabled && "calendar-cell-disabled",
    className,
  );
}
