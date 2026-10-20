// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { ScheduleData, YourPeerLegacyScheduleData } from "./common";

// Turns weekly service hours into short, scannable text, e.g.
// "Mon–Sat: 9 AM–5 PM. Closed Wednesdays.", and computes a Google-style
// "Open now · Closes at 5 PM" status. See yourpeer.nyc#201.
//
// Rows can also carry HSDS 3.0 recurrence (yourpeer.nyc#758): an ordinal
// BYDAY such as "2FR" (2nd Friday of the month), a valid_from/valid_to date
// range, and special hours: dated rows that close the service or give it
// other hours on those dates ("Closed December 25 (Christmas Day)").

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;

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

const WEEKDAY_ABBREVIATIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BYDAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

// How far ahead the open status looks for the next opening when a schedule
// has dates or monthly rules: long enough to get past a closed month.
const CALENDAR_LOOKAHEAD_DAYS = 62;

const toWeekday = (weekday: number) => (weekday === 0 ? 7 : weekday);

// The weeks of the month in an ordinal BYDAY for the row's weekday: [2] for
// "2FR", [1, 2] for "1FR,2FR", [-1] for "-1FR" (the last Friday). Empty when
// the row repeats every week.
function getOrdinals(row: ScheduleData, weekday = row.weekday): number[] {
  if (!row.byday || weekday == null) {
    return [];
  }
  const code = BYDAY_CODES[toWeekday(weekday) - 1];
  const ordinals: number[] = [];
  for (const part of row.byday.split(",")) {
    const match = part.trim().match(/^(-?[1-5])?([A-Z]{2})$/);
    const ordinal = match && match[1] ? parseInt(match[1], 10) : null;
    if (ordinal !== null && match![2] === code && !ordinals.includes(ordinal)) {
      ordinals.push(ordinal);
    }
  }
  return ordinals;
}

// Every row, with its weekday taken from the key it is grouped under.
const allRows = (schedule: YourPeerLegacyScheduleData): ScheduleData[] =>
  Object.entries(schedule || {}).flatMap(([weekday, rows]) =>
    (rows || []).map((row) => ({ ...row, weekday: parseInt(weekday, 10) })),
  );

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
      .filter(
        (hour) =>
          !hour.closed &&
          hour.opens_at &&
          hour.closes_at &&
          getOrdinals(hour, day).length === 0,
      )
      .map((hour) => toInterval(hour.opens_at, hour.closes_at));
    byDay[day] = [...(byDay[day] || []), ...intervals];
  });

  const normalized: NormalizedSchedule = {};
  Object.entries(byDay).forEach(([day, intervals]) => {
    if (intervals.length) {
      normalized[parseInt(day, 10)] = mergeIntervals(intervals);
    }
  });
  joinOvernightIntervals(normalized);
  return normalized;
}

// Overnight hours are usually entered as two rows split at midnight, e.g.
// Monday 21:00–23:59 and Tuesday 00:00–06:00. Join a day's last interval with
// the next morning's hours when they meet or overlap, so they read
// "9 PM–6 AM (next day)". Days open all day are left as they are.
function joinOvernightIntervals(normalized: NormalizedSchedule) {
  for (let day = 1; day <= 7; day++) {
    const intervals = normalized[day];
    const last = intervals?.[intervals.length - 1];
    if (!last || last.open === 0 || last.close < MINUTES_PER_DAY) {
      continue;
    }
    const nextDay = (day % 7) + 1;
    const morning = normalized[nextDay] || [];
    while (
      morning.length &&
      morning[0].close < MINUTES_PER_DAY &&
      morning[0].open <= last.close - MINUTES_PER_DAY
    ) {
      const joined = morning.shift()!;
      last.close = Math.max(last.close, joined.close + MINUTES_PER_DAY);
    }
    if (normalized[nextDay] && !morning.length) {
      delete normalized[nextDay];
    }
  }
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

const meridiem = (minutes: number) =>
  minutes % MINUTES_PER_DAY < 12 * 60 ? "AM" : "PM";

// "9 AM–5 PM", "2–5:30 PM" (AM/PM left off the start when it matches the
// end), "9 PM–6 AM (next day)", or "24 hours".
function formatInterval({ open, close }: Interval): string {
  if (open === 0 && close === MINUTES_PER_DAY) {
    return "24 hours";
  }
  const start = formatTime(open);
  const end = formatTime(close);
  const isMidnight = (minutes: number) => minutes % MINUTES_PER_DAY === 0;
  const shortStart =
    close <= MINUTES_PER_DAY &&
    !isMidnight(open) &&
    !isMidnight(close) &&
    meridiem(open) === meridiem(close)
      ? start.replace(/ (AM|PM)$/, "")
      : start;
  const range = `${shortStart}–${end}`;
  return close > MINUTES_PER_DAY ? `${range} (next day)` : range;
}

// "A", "A and B", "A, B, and C" (with the Oxford comma).
function joinWithAnd(items: string[]): string {
  if (items.length <= 2) {
    return items.join(" and ");
  }
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
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

const dayRange = (start: number, end: number) =>
  `${WEEKDAY_ABBREVIATIONS[start - 1]}–${WEEKDAY_ABBREVIATIONS[end - 1]}`;

// The day label for a group, plus a weekday the label spans but the service
// is closed on ("Mon–Sat" + Wednesday). `openDays` holds every day with any
// hours, so a day with different hours is never reported as closed.
function formatDays(
  days: number[],
  openDays: Set<number>,
): { label: string; closedDay: number | null } {
  if (days.length === 7) {
    return { label: "Daily", closedDay: null };
  }

  const missing = [1, 2, 3, 4, 5, 6, 7].filter((day) => !days.includes(day));
  if (days.length === 6) {
    if (missing[0] === 7) return { label: "Mon–Sat", closedDay: null };
    if (missing[0] === 1) return { label: "Tue–Sun", closedDay: null };
    if (!openDays.has(missing[0])) {
      return { label: "Daily", closedDay: missing[0] };
    }
  }

  const runs = dayRuns(days);

  // "Mon–Sat" + closed Wednesdays: two runs split by a single closed day that
  // together span at least five days without wrapping past Sunday.
  if (runs.length === 2) {
    const [[firstStart, firstEnd], [secondStart, secondEnd]] = runs;
    if (
      firstStart <= firstEnd &&
      secondStart <= secondEnd &&
      secondStart - firstEnd === 2 &&
      secondEnd - firstStart + 1 >= 5 &&
      !openDays.has(firstEnd + 1)
    ) {
      return {
        label: dayRange(firstStart, secondEnd),
        closedDay: firstEnd + 1,
      };
    }
  }

  const parts = runs.flatMap((run) => {
    const [start, end] = run;
    if (runLength(run) >= 3) {
      return [dayRange(start, end)];
    }
    return start === end
      ? [WEEKDAY_ABBREVIATIONS[start - 1]]
      : [WEEKDAY_ABBREVIATIONS[start - 1], WEEKDAY_ABBREVIATIONS[end - 1]];
  });
  return { label: joinWithAnd(parts), closedDay: null };
}

function intervalsKey(intervals: Interval[]): string {
  return intervals.map(({ open, close }) => `${open}-${close}`).join(",");
}

// "Mon–Sat: 9 AM–5 PM" phrases for the rows that repeat every week, plus a
// "Closed Wednesdays" note.
function formatWeekly(normalized: NormalizedSchedule): {
  phrases: string[];
  notes: string[];
} {
  const days = Object.keys(normalized).map((day) => parseInt(day, 10));
  if (!days.length) {
    return { phrases: [], notes: [] };
  }
  if (isOpen24_7(normalized)) {
    return { phrases: ["Open 24/7"], notes: [] };
  }

  // Days that share the exact same list of hours are described together.
  const groups = new Map<string, number[]>();
  days.forEach((day) => {
    const key = intervalsKey(normalized[day]);
    groups.set(key, [...(groups.get(key) || []), day]);
  });

  const openDays = new Set(days);
  const closedDays: number[] = [];
  const phrases = Array.from(groups.values())
    .map((groupDays) => {
      const { label, closedDay } = formatDays(groupDays, openDays);
      if (closedDay) {
        closedDays.push(closedDay);
      }
      return {
        // Groups read in weekly order; "Daily" leads.
        sortKey: groupDays.length >= 6 ? 0 : dayRuns(groupDays)[0][0],
        text: `${label}: ${joinWithAnd(normalized[groupDays[0]].map(formatInterval))}`,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ text }) => text);

  const notes = closedDays.length
    ? [`Closed ${joinWithAnd(closedDays.sort((a, b) => a - b).map(plural))}`]
    : [];
  return { phrases, notes };
}

const ORDINAL_WORDS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  [-1]: "last",
};

const WEEK_WORDS: Record<number, string> = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  [-1]: "last",
};

// "last" reads after the numbered ordinals.
const ordinalSortKey = (n: number) => (n < 0 ? 100 - n : n);

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);

// Monthly rows, grouped by ordinal. One weekday reads "2nd Friday of the
// month: 9 AM–5 PM". Several weekdays with the same ordinal cover a week of
// the month (1MO…1SU are the 1st–7th), so they read "First week of the
// month: Mon–Sat 24 hours, Sun 11 AM–12 PM" instead of one phrase per day.
function formatMonthly(rows: ScheduleData[]): string[] {
  const byOrdinal = new Map<number, YourPeerLegacyScheduleData>();
  rows.forEach((row) => {
    if (row.closed || !row.opens_at || !row.closes_at) {
      return;
    }
    getOrdinals(row).forEach((ordinal) => {
      const schedule = byOrdinal.get(ordinal) || {};
      const weekday = toWeekday(row.weekday!);
      // Without byday, normalizeSchedule treats the row as a weekly one.
      schedule[weekday] = [
        ...(schedule[weekday] || []),
        { ...row, byday: null },
      ];
      byOrdinal.set(ordinal, schedule);
    });
  });

  // Ordinals that describe the same days and hours are joined:
  // "1st and 3rd Saturday", "First and third week".
  const groups = new Map<
    string,
    { singleDay: number | null; body: string; ordinals: number[] }
  >();
  byOrdinal.forEach((schedule, ordinal) => {
    const normalized = normalizeSchedule(schedule);
    const days = Object.keys(normalized).map((day) => parseInt(day, 10));
    if (!days.length) return;

    let singleDay: number | null = null;
    let body: string;
    if (days.length === 1) {
      singleDay = days[0];
      body = joinWithAnd(normalized[singleDay].map(formatInterval));
    } else if (isOpen24_7(normalized)) {
      body = "open 24 hours every day";
    } else {
      const { phrases, notes } = formatWeekly(normalized);
      body = [
        ...phrases.map((phrase) => phrase.replace(": ", " ")),
        ...notes.map((note) => note.toLowerCase()),
      ].join(", ");
    }

    const key = `${singleDay}|${body}`;
    const group = groups.get(key) || { singleDay, body, ordinals: [] };
    group.ordinals.push(ordinal);
    groups.set(key, group);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      ordinals: group.ordinals.sort(
        (a, b) => ordinalSortKey(a) - ordinalSortKey(b),
      ),
    }))
    .sort(
      (a, b) =>
        ordinalSortKey(a.ordinals[0]) - ordinalSortKey(b.ordinals[0]) ||
        (a.singleDay || 0) - (b.singleDay || 0),
    )
    .map(({ singleDay, body, ordinals }) =>
      singleDay
        ? capitalize(
            `${joinWithAnd(ordinals.map((n) => ORDINAL_WORDS[n]))} ${WEEKDAY_NAMES[singleDay - 1]} of the month: ${body}`,
          )
        : capitalize(
            `${joinWithAnd(ordinals.map((n) => WEEK_WORDS[n]))} week${ordinals.length > 1 ? "s" : ""} of the month: ${body}`,
          ),
    );
}

function parseDate(date: string): Date {
  const [year, month, day] = date
    .slice(0, 10)
    .split("-")
    .map((part) => parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDate(date: string, withYear: boolean): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(parseDate(date));
}

// "Runs from March 27 to July 27, 2026", when every open row shares a range.
function formatValidRange(rows: ScheduleData[]): string | null {
  const ranges = new Set(
    rows
      .filter(({ closed }) => !closed)
      .map(
        ({ valid_from, valid_to }) => `${valid_from || ""}|${valid_to || ""}`,
      ),
  );
  if (ranges.size !== 1) {
    return null;
  }
  const [from, to] = Array.from(ranges)[0].split("|");
  if (from && to) {
    const sameYear = from.slice(0, 4) === to.slice(0, 4);
    return `Runs from ${formatDate(from, !sameYear)} to ${formatDate(to, true)}`;
  }
  if (from) return `Runs from ${formatDate(from, true)}`;
  if (to) return `Runs until ${formatDate(to, true)}`;
  return null;
}

const isWholeMonth = (from: string, to: string) => {
  const start = parseDate(from);
  const end = parseDate(to);
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0),
  );
  return start.getUTCDate() === 1 && end.getTime() === lastDay.getTime();
};

// Special hours: "Closed in December", "Closed December 25 (Christmas Day)
// and January 1", "December 31 (New Year's Eve): 10 AM–2 PM".
function formatSpecialHours(specialHours: ScheduleData[]): string[] {
  const months: string[] = [];
  const closedDates: string[] = [];
  const openDates: string[] = [];
  specialHours.forEach((row) => {
    const { valid_from: from, description } = row;
    const to = row.valid_to || from;
    if (!from || !to) return;
    const label = description ? ` (${description})` : "";

    if (row.closed && isWholeMonth(from, to)) {
      const month = new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "long",
      }).format(parseDate(from));
      if (!months.includes(month)) months.push(month);
      return;
    }
    const dates =
      from === to
        ? formatDate(from, false)
        : `${formatDate(from, false)} to ${formatDate(to, false)}`;
    if (row.closed || !row.opens_at || !row.closes_at) {
      closedDates.push(`${dates}${label}`);
    } else {
      openDates.push(
        `${dates}${label}: ${formatInterval(toInterval(row.opens_at, row.closes_at))}`,
      );
    }
  });
  return [
    ...(months.length ? [`Closed in ${joinWithAnd(months)}`] : []),
    ...(closedDates.length ? [`Closed ${joinWithAnd(closedDates)}`] : []),
    ...openDates,
  ];
}

export function formatSchedule(
  schedule: YourPeerLegacyScheduleData,
  specialHours: ScheduleData[] = [],
): string | null {
  const rows = allRows(schedule);
  const weekly = formatWeekly(normalizeSchedule(schedule));
  const phrases = [...weekly.phrases, ...formatMonthly(rows)];
  if (!phrases.length) {
    return null;
  }

  const validRange = formatValidRange(rows);
  const notes = [
    ...weekly.notes,
    ...(validRange ? [validRange] : []),
    ...formatSpecialHours(specialHours),
  ];
  return `${phrases.join("; ")}${notes.length ? `. ${notes.join(". ")}.` : ""}`;
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

function hasCalendarRules(
  rows: ScheduleData[],
  specialHours: ScheduleData[],
): boolean {
  return (
    specialHours.length > 0 ||
    rows.some(
      (row) => row.valid_from || row.valid_to || getOrdinals(row).length > 0,
    )
  );
}

const isWithin = (
  date: string,
  from: string | null | undefined,
  to: string | null | undefined,
) => (!from || from.slice(0, 10) <= date) && (!to || date <= to.slice(0, 10));

function matchesOrdinal(row: ScheduleData, date: Date): boolean {
  const ordinals = getOrdinals(row);
  if (!ordinals.length) {
    return true;
  }
  const dayOfMonth = date.getUTCDate();
  const daysInMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return ordinals.some((ordinal) =>
    ordinal > 0
      ? Math.ceil(dayOfMonth / 7) === ordinal
      : Math.ceil((daysInMonth - dayOfMonth + 1) / 7) === -ordinal,
  );
}

// Today's date (as a UTC midnight) and the minutes into it, in New York.
function newYorkToday(now: Date): { date: Date; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  return {
    date: new Date(Date.UTC(part("year"), part("month") - 1, part("day"))),
    minutes: (part("hour") % 24) * 60 + part("minute"),
  };
}

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * MINUTES_PER_DAY * 60 * 1000);

// Like describeDay, but past a week it names the date: " Friday, November 13".
function describeCalendarDay(target: number, today: Date): string {
  const dayDifference = Math.floor(target / MINUTES_PER_DAY);
  if (dayDifference === 0) return "";
  if (dayDifference === 1) return " tomorrow";
  const date = addDays(today, dayDifference);
  const weekday = WEEKDAY_NAMES[toWeekday(date.getUTCDay()) - 1];
  if (dayDifference <= 7) return ` ${weekday}`;
  return ` ${weekday}, ${formatDate(date.toISOString(), false)}`;
}

// The open status for schedules with dates, monthly rules or special hours:
// lays out the actual calendar days from yesterday onwards instead of one
// week. Like Google's special hours, a dated entry replaces the regular hours
// on its dates, either closing the service or giving it other hours.
function getCalendarOpenStatus(
  rows: ScheduleData[],
  now: Date,
  specialHours: ScheduleData[],
): OpenStatus | null {
  const { date: today, minutes: current } = newYorkToday(now);
  const openRows = rows.filter(
    (row) =>
      !row.closed && row.opens_at && row.closes_at && row.weekday != null,
  );

  const intervals: Interval[] = [];
  for (let offset = -1; offset <= CALENDAR_LOOKAHEAD_DAYS; offset++) {
    const date = addDays(today, offset);
    const isoDate = date.toISOString().slice(0, 10);
    const weekday = toWeekday(date.getUTCDay());
    const special = specialHours.filter(
      (entry) =>
        (entry.weekday == null || toWeekday(entry.weekday) === weekday) &&
        isWithin(isoDate, entry.valid_from, entry.valid_to || entry.valid_from),
    );
    const dayRows = special.length
      ? special.filter(
          (entry) => !entry.closed && entry.opens_at && entry.closes_at,
        )
      : openRows.filter(
          (row) =>
            toWeekday(row.weekday!) === weekday &&
            isWithin(isoDate, row.valid_from, row.valid_to) &&
            matchesOrdinal(row, date),
        );

    dayRows.forEach((row) => {
      const { open, close } = toInterval(row.opens_at, row.closes_at);
      const dayStart = offset * MINUTES_PER_DAY;
      intervals.push({ open: dayStart + open, close: dayStart + close });
    });
  }
  const timeline = mergeIntervals(intervals);

  const openInterval = timeline.find(
    ({ open, close }) => open <= current && current < close,
  );
  if (openInterval) {
    const closingSoon = openInterval.close - current <= CLOSING_SOON_MINUTES;
    const closesAt = `${describeCalendarDay(openInterval.close, today)} at ${formatTime(openInterval.close)}`;
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
    label: `Closed · Opens${describeCalendarDay(next.open, today)} at ${formatTime(next.open)}`,
  };
}

export function getOpenStatus(
  schedule: YourPeerLegacyScheduleData,
  now: Date,
  specialHours: ScheduleData[] = [],
): OpenStatus | null {
  const rows = allRows(schedule);
  if (hasCalendarRules(rows, specialHours)) {
    return getCalendarOpenStatus(rows, now, specialHours);
  }

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
