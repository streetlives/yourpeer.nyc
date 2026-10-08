// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { YourPeerLegacyScheduleData } from "./common";

// Turns weekly service hours into a conversational sentence, e.g.
// "Open Monday to Saturday except Wednesdays 9 AM to 5 PM", and computes a
// Google-style "Open now · Closes at 5 PM" status. See yourpeer.nyc#201.

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;

// A gap within a day is described as a break in one span ("9 AM to 5 PM with
// a break from 12 PM to 1 PM") only if it is at most this long and shorter
// than the open periods on both sides. Otherwise, as with separate meal times,
// the time ranges are listed.
export const MAX_BREAK_MINUTES = 60;

// "Open now" turns into "Closes soon" this many minutes before closing.
export const CLOSING_SOON_MINUTES = 60;

const TIME_ZONE = "America/New_York";

const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Minutes since the start of the opening day. `close` is always greater than
// `open`; overnight intervals have `close` > MINUTES_PER_DAY.
export interface Interval {
  open: number;
  close: number;
}

// weekday (1 = Monday ... 7 = Sunday) -> sorted, merged intervals.
export type NormalizedSchedule = Record<number, Interval[]>;

export interface OpenStatus {
  open: boolean;
  closingSoon: boolean;
  label: string;
}

function parseMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => parseInt(part, 10));
  return hours * 60 + (minutes || 0);
}

function toInterval(opensAt: string, closesAt: string): Interval {
  const open = parseMinutes(opensAt);
  let close = parseMinutes(closesAt);
  // "23:59" and "00:00" closing times both mean midnight.
  if (closesAt.startsWith("23:59") || close === 0) {
    close = MINUTES_PER_DAY;
  }
  if (close <= open) {
    close += MINUTES_PER_DAY;
  }
  return { open, close };
}

function mergeIntervals(intervals: Interval[]): Interval[] {
  const sorted = [...intervals].sort(
    (a, b) => a.open - b.open || a.close - b.close,
  );
  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (last && interval.open <= last.close) {
      last.close = Math.max(last.close, interval.close);
    } else {
      merged.push({ ...interval });
    }
  }
  return merged;
}

export function normalizeSchedule(
  schedule: YourPeerLegacyScheduleData,
): NormalizedSchedule {
  const byDay: Record<number, Interval[]> = {};
  Object.entries(schedule || {}).forEach(([weekday, hours]) => {
    // The API sends 1 = Monday ... 7 = Sunday. Accept JavaScript's 0 for
    // Sunday too, as the API's own getDayOfWeekIntegerFromDate does.
    const parsed = parseInt(weekday, 10);
    const day = parsed === 0 ? 7 : parsed;
    if (!(day >= 1 && day <= 7)) {
      return;
    }
    const intervals = (hours || [])
      .filter((hour) => !hour.closed && hour.opens_at && hour.closes_at)
      .map((hour) => toInterval(hour.opens_at, hour.closes_at));
    byDay[day] = [...(byDay[day] || []), ...intervals];
  });

  const normalized: NormalizedSchedule = {};
  Object.entries(byDay).forEach(([day, intervals]) => {
    if (intervals.length) {
      normalized[parseInt(day, 10)] = mergeIntervals(intervals);
    }
  });
  return normalized;
}

export function isOpen24_7(normalized: NormalizedSchedule): boolean {
  return WEEKDAY_NAMES.every((_, index) =>
    (normalized[index + 1] || []).some(
      ({ open, close }) => open === 0 && close >= MINUTES_PER_DAY,
    ),
  );
}

export function formatTime(minutes: number): string {
  const minuteOfDay = minutes % MINUTES_PER_DAY;
  if (minuteOfDay === 0) {
    return "midnight";
  }
  const hours24 = Math.floor(minuteOfDay / 60);
  const mins = minuteOfDay % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const suffix = hours24 < 12 ? "AM" : "PM";
  return `${hours12}${mins ? `:${String(mins).padStart(2, "0")}` : ""} ${suffix}`;
}

function formatInterval({ open, close }: Interval): string {
  if (open === 0 && close === MINUTES_PER_DAY) {
    return "24 hours";
  }
  const range = `${formatTime(open)} to ${formatTime(close)}`;
  return close > MINUTES_PER_DAY ? `${range} the next day` : range;
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) {
    return items.join("");
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function formatIntervals(intervals: Interval[]): string {
  if (intervals.length === 1) {
    return formatInterval(intervals[0]);
  }

  const gaps = intervals.slice(1).map((interval, index) => ({
    open: intervals[index].close,
    close: interval.open,
  }));
  const isOneSpanWithBreaks =
    intervals[intervals.length - 1].close <= MINUTES_PER_DAY &&
    gaps.every(({ open, close }, index) => {
      const gap = close - open;
      const before = intervals[index].close - intervals[index].open;
      const after = intervals[index + 1].close - intervals[index + 1].open;
      return gap <= MAX_BREAK_MINUTES && gap < before && gap < after;
    });

  if (isOneSpanWithBreaks) {
    const span = formatInterval({
      open: intervals[0].open,
      close: intervals[intervals.length - 1].close,
    });
    const breaks = joinWithAnd(gaps.map(formatInterval));
    return `${span} with ${gaps.length === 1 ? "a break" : "breaks"} from ${breaks}`;
  }

  return joinWithAnd(intervals.map(formatInterval));
}

function plural(weekday: number): string {
  return `${WEEKDAY_NAMES[weekday - 1]}s`;
}

const nextDay = (day: number) => (day % 7) + 1;
const previousDay = (day: number) => ((day + 5) % 7) + 1;

// Consecutive runs of days, wrapping from Sunday back to Monday, as
// [start, end] pairs sorted by start day.
function dayRuns(days: number[]): [number, number][] {
  const set = new Set(days);
  return days
    .filter((day) => !set.has(previousDay(day)))
    .sort((a, b) => a - b)
    .map((start) => {
      let end = start;
      while (set.has(nextDay(end)) && nextDay(end) !== start) {
        end = nextDay(end);
      }
      return [start, end];
    });
}

const runLength = ([start, end]: [number, number]) =>
  ((end - start + 7) % 7) + 1;

function formatDays(days: number[]): string {
  if (days.length === 7) {
    return "every day";
  }
  if (days.length === 6) {
    const missing = [1, 2, 3, 4, 5, 6, 7].find((day) => !days.includes(day))!;
    if (missing === 7) return "Monday to Saturday";
    if (missing === 1) return "Tuesday to Sunday";
    return `every day except ${plural(missing)}`;
  }

  const runs = dayRuns(days);

  // "Monday to Saturday except Wednesdays": two runs split by a single day
  // that together span at least five days without wrapping past Sunday.
  if (runs.length === 2) {
    const [[firstStart, firstEnd], [secondStart, secondEnd]] = runs;
    if (
      firstStart <= firstEnd &&
      secondStart <= secondEnd &&
      secondStart - firstEnd === 2 &&
      secondEnd - firstStart + 1 >= 5
    ) {
      return `${WEEKDAY_NAMES[firstStart - 1]} to ${WEEKDAY_NAMES[secondEnd - 1]} except ${plural(firstEnd + 1)}`;
    }
  }

  const parts = runs.flatMap((run) => {
    const [start, end] = run;
    if (runLength(run) >= 3) {
      return [`${WEEKDAY_NAMES[start - 1]} to ${WEEKDAY_NAMES[end - 1]}`];
    }
    return start === end ? [plural(start)] : [plural(start), plural(end)];
  });
  return joinWithAnd(parts);
}

function intervalsKey(intervals: Interval[]): string {
  return intervals.map(({ open, close }) => `${open}-${close}`).join(",");
}

export function formatSchedule(
  schedule: YourPeerLegacyScheduleData,
): string | null {
  const normalized = normalizeSchedule(schedule);
  const days = Object.keys(normalized).map((day) => parseInt(day, 10));
  if (!days.length) {
    return null;
  }
  if (isOpen24_7(normalized)) {
    return "Open 24/7";
  }

  // Days that share the exact same list of hours are described together.
  const groups = new Map<string, number[]>();
  days.forEach((day) => {
    const key = intervalsKey(normalized[day]);
    groups.set(key, [...(groups.get(key) || []), day]);
  });

  const phrases = Array.from(groups.values())
    .map((groupDays) => ({
      // Groups read in weekly order; "every day (except ...)" leads.
      sortKey: groupDays.length >= 6 ? 0 : dayRuns(groupDays)[0][0],
      text: `${formatDays(groupDays)} ${formatIntervals(normalized[groupDays[0]])}`,
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ text }) => text);

  return `Open ${phrases.join("; ")}`;
}

// Minutes since Monday 00:00 in New York for the given instant.
function minutesIntoWeek(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value || "";
  const weekday = WEEKDAY_NAMES.indexOf(part("weekday")) + 1;
  const hours = parseInt(part("hour"), 10) % 24;
  const minutes = parseInt(part("minute"), 10);
  return (weekday - 1) * MINUTES_PER_DAY + hours * 60 + minutes;
}

function describeDay(target: number, now: number): string {
  const dayDifference =
    Math.floor(target / MINUTES_PER_DAY) - Math.floor(now / MINUTES_PER_DAY);
  if (dayDifference === 0) return "";
  if (dayDifference === 1) return " tomorrow";
  const weekday = ((Math.floor(target / MINUTES_PER_DAY) % 7) + 7) % 7; // 0 = Monday
  return ` ${WEEKDAY_NAMES[weekday]}`;
}

export function getOpenStatus(
  schedule: YourPeerLegacyScheduleData,
  now: Date,
): OpenStatus | null {
  const normalized = normalizeSchedule(schedule);
  if (!Object.keys(normalized).length) {
    return null;
  }
  if (isOpen24_7(normalized)) {
    return { open: true, closingSoon: false, label: "Open now" };
  }

  // Lay the week out on one timeline, with copies of the previous and next
  // week so that overnight hours crossing Sunday night are covered.
  const weekly = Object.entries(normalized).flatMap(([weekday, intervals]) =>
    intervals.map(({ open, close }) => {
      const dayStart = (parseInt(weekday, 10) - 1) * MINUTES_PER_DAY;
      return { open: dayStart + open, close: dayStart + close };
    }),
  );
  const timeline = mergeIntervals(
    [-MINUTES_PER_WEEK, 0, MINUTES_PER_WEEK].flatMap((offset) =>
      weekly.map(({ open, close }) => ({
        open: open + offset,
        close: close + offset,
      })),
    ),
  );

  const current = minutesIntoWeek(now);
  const openInterval = timeline.find(
    ({ open, close }) => open <= current && current < close,
  );
  if (openInterval) {
    const closingSoon = openInterval.close - current <= CLOSING_SOON_MINUTES;
    const closesAt = `${describeDay(openInterval.close, current)} at ${formatTime(openInterval.close)}`;
    return {
      open: true,
      closingSoon,
      label: closingSoon
        ? `Open now · Closes soon${closesAt}`
        : `Open now · Closes${closesAt}`,
    };
  }

  const next = timeline.find(({ open }) => open > current);
  if (!next) {
    return null;
  }
  return {
    open: false,
    closingSoon: false,
    label: `Closed · Opens${describeDay(next.open, current)} at ${formatTime(next.open)}`,
  };
}
