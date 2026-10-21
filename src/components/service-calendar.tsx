// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useMemo, useState } from "react";
import { ScheduleData, YourPeerLegacyScheduleData } from "./common";
import {
  DaySchedule,
  getDaySchedule,
  getRelevantHours,
  newYorkDate,
} from "./schedule-format";
import { cn } from "@/lib/utils";
import { TranslatableText } from "./translatable-text";

// A month view of a service's hours, including monthly rules ("1st and 2nd
// Mondays"), seasons and special hours such as holidays. See
// yourpeer.nyc#758. On phones the days only show whether the service is open;
// tapping a day shows its hours underneath.

// Marks a day with more time ranges than the cell shows; tap for all of them.
const MORE_HOURS = "+";

const WEEKDAY_HEADINGS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// How many months ahead people can page to.
const MAX_MONTHS_AHEAD = 11;

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const formatUtc = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(
    new Date(`${date}T00:00:00Z`),
  );

function isOpen(day: DaySchedule) {
  return day.hours.length > 0;
}

// Short text for a day's cell on wider screens: one time range (on today,
// the one that matters now), as up to two lines split after the dash, e.g.
// ["9:30 AM–", "12:30 PM"]. "(next day)" is left to the details below.
export function cellLines(day: DaySchedule, now: Date): string[] {
  const hours = getRelevantHours(day, now);
  if (!hours) return ["Closed"];
  const [start, end] = hours.replace(" (next day)", "").split("–");
  return end === undefined ? [start] : [`${start}–`, end];
}

function describeDay(day: DaySchedule): string {
  const hours = isOpen(day) ? day.hours.join(", ") : "Closed";
  const label = day.special?.label ? ` (${day.special.label})` : "";
  return `${hours}${label}`;
}

export default function ServiceCalendar({
  schedule,
  specialHours = [],
  now,
}: {
  schedule: YourPeerLegacyScheduleData;
  specialHours?: ScheduleData[];
  now: Date;
}) {
  const today = newYorkDate(now);
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState(today);

  const year = todayYear + Math.floor((todayMonth - 1 + monthOffset) / 12);
  const month = (todayMonth - 1 + monthOffset) % 12;

  const days = useMemo(() => {
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Array.from({ length: daysInMonth }, (_, i) =>
      getDaySchedule(schedule, specialHours, isoDate(year, month, i + 1)),
    );
  }, [schedule, specialHours, year, month]);

  // Monday-first: blank cells before the 1st.
  const leadingBlanks =
    (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const selectedDay =
    days.find((day) => day.date === selected) ||
    getDaySchedule(schedule, specialHours, selected);
  const specialDays = days.filter((day) => day.special);
  const selectedHeading = `${
    selected === today
      ? "Today"
      : formatUtc(selected, { weekday: "long", month: "long", day: "numeric" })
  }:`;

  const changeMonth = (delta: number) => {
    const offset = monthOffset + delta;
    setMonthOffset(offset);
    // Keep a selection in view: today in the current month, else the 1st.
    const nextYear = todayYear + Math.floor((todayMonth - 1 + offset) / 12);
    const nextMonth = (todayMonth - 1 + offset) % 12;
    setSelected(offset === 0 ? today : isoDate(nextYear, nextMonth, 1));
  };

  return (
    <div className="mt-3 text-dark" data-testid="service-calendar">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          className="px-3 py-1 rounded disabled:opacity-30"
          onClick={() => changeMonth(-1)}
          disabled={monthOffset === 0}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-medium" aria-live="polite">
          {formatUtc(isoDate(year, month, 1), {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          type="button"
          className="px-3 py-1 rounded disabled:opacity-30"
          onClick={() => changeMonth(1)}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_HEADINGS.map((heading) => (
          <div key={heading} className="text-xs text-grey-700" aria-hidden>
            {heading}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const open = isOpen(day);
          const isPast = day.date < today;
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={day.date === selected}
              aria-label={`${formatUtc(day.date, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}: ${describeDay(day)}`}
              onClick={() => setSelected(day.date)}
              className={cn(
                "rounded h-11 sm:h-16 p-1 flex flex-col items-center text-sm border overflow-hidden",
                open
                  ? "bg-success/15 border-success/30"
                  : "bg-grey-100 border-transparent",
                day.special && "border-amber-300 border-2",
                day.date === today && "font-bold",
                day.date === selected && "ring-2 ring-dark",
                isPast && "opacity-40",
              )}
            >
              <span>
                {Number(day.date.slice(8))}
                {day.hours.length > 1 ? (
                  <span
                    className="hidden sm:inline ml-0.5 text-[10px] font-bold align-top"
                    aria-hidden
                  >
                    {MORE_HOURS}
                  </span>
                ) : undefined}
              </span>
              {cellLines(day, now).map((line) => (
                <span
                  key={line}
                  className="hidden sm:block w-full truncate text-[10px] leading-tight"
                >
                  {line}
                </span>
              ))}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-grey-700">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-success/15 border border-success/30" />
          <TranslatableText text="Open" id="#service-calendar-Open" />
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-grey-100" />
          <TranslatableText text="Closed" id="#service-calendar-Closed" />
        </span>
        {specialDays.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded border-2 border-amber-300" />
            <TranslatableText
              text="Special hours"
              id="#service-calendar-SpecialHours"
            />
          </span>
        )}
      </div>

      <p className="mt-3 text-sm">
        <span className="font-medium">{selectedHeading}</span>{" "}
        {describeDay(selectedDay)}
      </p>
      {selectedDay.notes.map((note) => (
        <p key={note} className="text-sm font-medium mt-1">
          {note}
        </p>
      ))}
    </div>
  );
}
