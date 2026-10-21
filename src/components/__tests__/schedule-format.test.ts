import { describe, test, expect } from "vitest";
import {
  formatSchedule,
  getOpenStatus,
  getScheduleNotes,
  getDaySchedule,
  getRelevantHours,
} from "../schedule-format";
import { ScheduleData, YourPeerLegacyScheduleData } from "../common";

type Hours = [string, string, { closed: boolean }?];

function hours(
  opensAt: string,
  closesAt: string,
  closed = false,
): ScheduleData {
  return {
    id: `${opensAt}-${closesAt}`,
    closed,
    opens_at: opensAt,
    closes_at: closesAt,
    start_date: null,
    end_date: null,
    weekday: null,
    occasion: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    location_id: null,
  } as ScheduleData;
}

// Builds a schedule with the same hours on each listed weekday.
function on(
  weekdays: number[],
  ...ranges: Hours[]
): YourPeerLegacyScheduleData {
  return Object.fromEntries(
    weekdays.map((day) => [
      day,
      ranges.map(([open, close, options]) =>
        hours(open, close, options?.closed),
      ),
    ]),
  );
}

const MON_TO_FRI = [1, 2, 3, 4, 5];
const EVERY_DAY = [1, 2, 3, 4, 5, 6, 7];

describe("formatSchedule", () => {
  test.each<[string, YourPeerLegacyScheduleData, string | null]>([
    ["no schedule", {}, null],
    [
      "only closed rows",
      on([1], ["09:00:00", "17:00:00", { closed: true }]),
      null,
    ],
    [
      "weekday 0 is Sunday (Emergency Shelter in tests/fixtures/locations.json)",
      on([0], ["00:00", "23:59"]),
      "Sun: 24 hours",
    ],
    [
      "weekday 0 and 7 are merged as Sunday",
      { ...on([0], ["09:00", "11:00"]), ...on([7], ["15:00", "17:00"]) },
      "Sun: 9–11 AM and 3–5 PM",
    ],
    [
      "weekday 0 completes 24/7",
      on([0, 1, 2, 3, 4, 5, 6], ["00:00:00", "23:59:00"]),
      "Open 24/7",
    ],
    ["unknown weekdays are ignored", on([8], ["09:00", "17:00"]), null],
    ["single day", on([1], ["17:00:00", "18:00:00"]), "Mon: 5–6 PM"],
    [
      "two days",
      on([1, 2], ["09:00:00", "17:00:00"]),
      "Mon and Tue: 9 AM–5 PM",
    ],
    [
      "weekday run",
      on(MON_TO_FRI, ["09:00:00", "17:00:00"]),
      "Mon–Fri: 9 AM–5 PM",
    ],
    ["every day", on(EVERY_DAY, ["09:00:00", "17:00:00"]), "Daily: 9 AM–5 PM"],
    [
      "one missing day inside a run",
      on([1, 2, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Mon–Sat: 9 AM–5 PM. Closed Wednesdays.",
    ],
    [
      "six days missing Sunday",
      on([1, 2, 3, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Mon–Sat: 9 AM–5 PM",
    ],
    [
      "six days missing midweek",
      on([1, 2, 4, 5, 6, 7], ["09:00:00", "17:00:00"]),
      "Daily: 9 AM–5 PM. Closed Wednesdays.",
    ],
    [
      "weekdays with a closed midweek day",
      on([1, 2, 4, 5], ["09:00:00", "17:00:00"]),
      "Mon–Fri: 9 AM–5 PM. Closed Wednesdays.",
    ],
    [
      "discontinuous days",
      on([1, 2, 5, 6], ["09:00:00", "17:00:00"]),
      "Mon, Tue, Fri, and Sat: 9 AM–5 PM",
    ],
    [
      "short days plus a longer run",
      on([1, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Mon and Thu–Sat: 9 AM–5 PM",
    ],
    [
      "weekend wraparound",
      on([6, 7, 1], ["10:00:00", "14:00:00"]),
      "Sat–Mon: 10 AM–2 PM",
    ],
    [
      "CUCS meals: unsorted and duplicated rows become one sentence",
      on(
        EVERY_DAY,
        ["17:00:00", "19:00:00"],
        ["11:30:00", "13:30:00"],
        ["07:30:00", "09:30:00"],
        ["17:00:00", "19:00:00"],
      ),
      "Daily: 7:30–9:30 AM, 11:30 AM–1:30 PM, and 5–7 PM",
    ],
    [
      "several ranges in a day, with the Oxford comma",
      on(
        MON_TO_FRI,
        ["09:00:00", "11:00:00"],
        ["12:00:00", "14:00:00"],
        ["15:00:00", "17:00:00"],
      ),
      "Mon–Fri: 9–11 AM, 12–2 PM, and 3–5 PM",
    ],
    [
      "two ranges in a day",
      on([3], ["09:00:00", "12:00:00"], ["13:00:00", "17:00:00"]),
      "Wed: 9 AM–12 PM and 1–5 PM",
    ],
    // Real schedules from the database (yourpeer.nyc#201).
    [
      "lunch break (new-york-city-bar-legal-referral-service-hells-kitchen)",
      on(MON_TO_FRI, ["08:30:00", "13:00:00"], ["14:00:00", "17:30:00"]),
      "Mon–Fri: 8:30 AM–1 PM and 2–5:30 PM",
    ],
    [
      "two ranges (boom-health-mott-haven)",
      on(MON_TO_FRI, ["09:00:00", "11:00:00"], ["13:00:00", "17:00:00"]),
      "Mon–Fri: 9–11 AM and 1–5 PM",
    ],
    [
      "short ranges (hamilton-madison-house-financial-district)",
      on(MON_TO_FRI, ["09:00:00", "09:30:00"], ["11:30:00", "12:30:00"]),
      "Mon–Fri: 9–9:30 AM and 11:30 AM–12:30 PM",
    ],
    [
      "Thursday has other hours, so it is not reported closed (st-anns-corner-of-harm-reduction-sachr-longwood)",
      {
        ...on(
          [1, 2, 3, 5],
          ["09:00:00", "11:00:00"],
          ["13:00:00", "15:30:00"],
          ["17:00:00", "18:30:00"],
        ),
        ...on(
          [4],
          ["09:00:00", "11:00:00"],
          ["13:00:00", "15:00:00"],
          ["17:00:00", "18:30:00"],
        ),
      },
      "Mon–Wed and Fri: 9–11 AM, 1–3:30 PM, and 5–6:30 PM; Thu: 9–11 AM, 1–3 PM, and 5–6:30 PM",
    ],
    [
      "a closed day is noted after other groups",
      {
        ...on([1, 2, 4, 5], ["09:00:00", "17:00:00"]),
        ...on([6], ["10:00:00", "14:00:00"]),
      },
      "Mon–Fri: 9 AM–5 PM; Sat: 10 AM–2 PM. Closed Wednesdays.",
    ],
    [
      "a day with other hours is listed, not reported closed",
      {
        ...on([1, 2, 4, 5, 6], ["09:00:00", "17:00:00"]),
        ...on([3], ["10:00:00", "14:00:00"]),
      },
      "Mon, Tue, and Thu–Sat: 9 AM–5 PM; Wed: 10 AM–2 PM",
    ],
    [
      "overlapping rows are merged",
      on([3], ["09:00:00", "13:00:00"], ["12:00:00", "17:00:00"]),
      "Wed: 9 AM–5 PM",
    ],
    [
      "adjacent rows are merged",
      on([1], ["09:00:00", "12:00:00"], ["12:00:00", "17:00:00"]),
      "Mon: 9 AM–5 PM",
    ],
    [
      "a row inside another is merged",
      on([1], ["09:00:00", "17:00:00"], ["10:00:00", "11:00:00"]),
      "Mon: 9 AM–5 PM",
    ],
    [
      "duplicate overnight rows",
      on([1], ["21:00:00", "06:00:00"], ["21:00:00", "06:00:00"]),
      "Mon: 9 PM–6 AM (next day)",
    ],
    [
      "overnight split at midnight every night (ali-forney-center-afc-hells-kitchen)",
      on(EVERY_DAY, ["00:00:00", "08:00:00"], ["20:00:00", "23:59:00"]),
      "Daily: 8 PM–8 AM (next day)",
    ],
    [
      "overnight split at midnight on weeknights (holy-apostles-soup-kitchen-chelsea)",
      {
        ...on([1], ["21:00:00", "23:59:00"]),
        ...on([2, 3, 4, 5], ["00:00:00", "08:00:00"], ["21:00:00", "23:59:00"]),
        ...on([6], ["00:00:00", "08:00:00"]),
      },
      "Mon–Fri: 9 PM–8 AM (next day)",
    ],
    [
      "overnight split from Sunday into Monday",
      {
        ...on([7], ["21:00:00", "23:59:00"]),
        ...on([1], ["00:00:00", "06:00:00"]),
      },
      "Sun: 9 PM–6 AM (next day)",
    ],
    [
      "overnight running into the next morning's hours",
      {
        ...on([1], ["21:00:00", "06:00:00"]),
        ...on([2], ["05:00:00", "09:00:00"]),
      },
      "Mon: 9 PM–9 AM (next day)",
    ],
    [
      "early hours with no evening before stay on their own day",
      on([2], ["00:00:00", "06:00:00"]),
      "Tue: midnight–6 AM",
    ],
    [
      "a 24-hour day is not joined to the next morning",
      {
        ...on([1], ["00:00:00", "23:59:00"]),
        ...on([2], ["00:00:00", "06:00:00"]),
      },
      "Mon: 24 hours; Tue: midnight–6 AM",
    ],
    [
      "overnight",
      on(MON_TO_FRI, ["21:00:00", "06:00:00"]),
      "Mon–Fri: 9 PM–6 AM (next day)",
    ],
    [
      "closing at midnight",
      on([5], ["18:00:00", "23:59:00"]),
      "Fri: 6 PM–midnight",
    ],
    ["24/7", on(EVERY_DAY, ["00:00:00", "23:59:00"]), "Open 24/7"],
    [
      "all day on some days",
      on([6, 7], ["00:00:00", "23:59:00"]),
      "Sat and Sun: 24 hours",
    ],
    [
      "weekday and weekend hours, listed in weekly order",
      {
        ...on([6, 7], ["10:00:00", "14:00:00"]),
        ...on(MON_TO_FRI, ["09:00:00", "17:00:00"]),
      },
      "Mon–Fri: 9 AM–5 PM; Sat and Sun: 10 AM–2 PM",
    ],
  ])("%s", (_, schedule, expected) => {
    expect(formatSchedule(schedule)).toBe(expected);
  });
});

describe("getOpenStatus", () => {
  // 2026-10-05 is a Monday; New York is on EDT (UTC-4).
  const at = (isoLocal: string) => new Date(`${isoLocal}-04:00`);
  const weekdays = on(MON_TO_FRI, ["09:00:00", "17:00:00"]);

  test.each<[string, YourPeerLegacyScheduleData, string, string | null]>([
    [
      "before opening",
      weekdays,
      "2026-10-05T08:00:00",
      "Closed · Opens at 9 AM",
    ],
    [
      "while open",
      weekdays,
      "2026-10-05T12:00:00",
      "Open now · Closes at 5 PM",
    ],
    [
      "closing soon",
      weekdays,
      "2026-10-05T16:30:00",
      "Open now · Closes soon at 5 PM",
    ],
    [
      "after closing, opens tomorrow",
      weekdays,
      "2026-10-05T18:00:00",
      "Closed · Opens tomorrow at 9 AM",
    ],
    [
      "Sunday evening, next opening is Monday",
      weekdays,
      "2026-10-11T18:00:00",
      "Closed · Opens tomorrow at 9 AM",
    ],
    [
      "Saturday, next opening is Monday",
      weekdays,
      "2026-10-10T12:00:00",
      "Closed · Opens Monday at 9 AM",
    ],
    [
      "inside an overnight interval just after midnight",
      on(MON_TO_FRI, ["21:00:00", "06:00:00"]),
      "2026-10-06T00:30:00",
      "Open now · Closes at 6 AM",
    ],
    [
      "overnight interval opened Sunday, viewed Monday morning",
      on([7], ["21:00:00", "06:00:00"]),
      "2026-10-05T01:00:00",
      "Open now · Closes at 6 AM",
    ],
    [
      "overnight interval before midnight closes tomorrow",
      on(MON_TO_FRI, ["21:00:00", "06:00:00"]),
      "2026-10-05T22:00:00",
      "Open now · Closes tomorrow at 6 AM",
    ],
    [
      "24/7",
      on(EVERY_DAY, ["00:00:00", "23:59:00"]),
      "2026-10-05T03:00:00",
      "Open now",
    ],
    [
      "weekday 0 counts as Sunday",
      on([0], ["09:00", "17:00"]),
      "2026-10-11T12:00:00",
      "Open now · Closes at 5 PM",
    ],
    [
      "overnight split at midnight, late evening",
      on(EVERY_DAY, ["00:00:00", "08:00:00"], ["20:00:00", "23:59:00"]),
      "2026-10-05T23:30:00",
      "Open now · Closes tomorrow at 8 AM",
    ],
    [
      "overnight split at midnight, early morning",
      on(EVERY_DAY, ["00:00:00", "08:00:00"], ["20:00:00", "23:59:00"]),
      "2026-10-06T03:00:00",
      "Open now · Closes at 8 AM",
    ],
    ["no schedule", {}, "2026-10-05T12:00:00", null],
  ])("%s", (_, schedule, now, expected) => {
    expect(getOpenStatus(schedule, at(now))?.label ?? null).toBe(expected);
  });

  test("flags closing soon so it can be styled", () => {
    expect(getOpenStatus(weekdays, at("2026-10-05T16:30:00"))).toEqual({
      open: true,
      closingSoon: true,
      label: "Open now · Closes soon at 5 PM",
    });
  });
});

// HSDS 3.0 recurrence (yourpeer.nyc#758).
describe("monthly and dated schedules", () => {
  const nineToFive = (extra: Partial<ScheduleData> = {}): ScheduleData => ({
    ...hours("09:00:00", "17:00:00"),
    ...extra,
  });
  const december: ScheduleData = {
    ...hours("", "", true),
    opens_at: null as unknown as string,
    closes_at: null as unknown as string,
    valid_from: "2026-12-01",
    valid_to: "2026-12-31",
  };
  const weekdays = (extra: Partial<ScheduleData> = {}) =>
    Object.fromEntries(MON_TO_FRI.map((day) => [day, [nineToFive(extra)]]));

  describe("formatSchedule", () => {
    test.each<[string, YourPeerLegacyScheduleData, ScheduleData[], string]>([
      [
        "an ordinal weekday",
        { 5: [nineToFive({ byday: "2FR" })] },
        [],
        "2nd Friday of the month: 9 AM–5 PM",
      ],
      [
        "the last weekday of the month",
        { 1: [nineToFive({ byday: "-1MO" })] },
        [],
        "Last Monday of the month: 9 AM–5 PM",
      ],
      [
        "weekly hours alongside monthly ones",
        {
          ...weekdays(),
          6: [
            { ...hours("10:00:00", "14:00:00"), byday: "1SA" },
            { ...hours("10:00:00", "14:00:00"), byday: "3SA" },
          ],
        },
        [],
        "Mon–Fri: 9 AM–5 PM; 1st and 3rd Saturdays of the month: 10 AM–2 PM",
      ],
      [
        "the same ordinal on several days reads as a week of the month",
        {
          ...Object.fromEntries(
            [1, 2, 3, 4, 5, 6].map((day) => [
              day,
              [
                {
                  ...hours("00:00:00", "23:59:00"),
                  byday: `1${["MO", "TU", "WE", "TH", "FR", "SA"][day - 1]}`,
                },
              ],
            ]),
          ),
          7: [{ ...hours("11:00:00", "12:00:00"), byday: "1SU" }],
        },
        [],
        "First week of the month: Mon–Sat 24 hours, Sun 11 AM–12 PM",
      ],
      [
        "a whole week open around the clock",
        Object.fromEntries(
          EVERY_DAY.map((day) => [
            day,
            [
              {
                ...hours("00:00:00", "23:59:00"),
                byday: `-1${["MO", "TU", "WE", "TH", "FR", "SA", "SU"][day - 1]}`,
              },
            ],
          ]),
        ),
        [],
        "Last week of the month: open 24 hours every day",
      ],
      [
        "a date range",
        weekdays({ valid_from: "2026-03-27", valid_to: "2026-07-27" }),
        [],
        "Mon–Fri: 9 AM–5 PM. Runs from March 27 to July 27, 2026.",
      ],
      [
        "an open-ended range",
        weekdays({ valid_to: "2026-07-27" }),
        [],
        "Mon–Fri: 9 AM–5 PM. Runs until July 27, 2026.",
      ],
      [
        "a closed month",
        { 5: [nineToFive({ byday: "2FR" })] },
        [december],
        "2nd Friday of the month: 9 AM–5 PM. Closed in December.",
      ],
    ])("%s", (_, schedule, exceptions, expected) => {
      expect(formatSchedule(schedule, exceptions)).toBe(expected);
    });

    test("weekly BYDAY without an ordinal reads as weekly hours", () => {
      expect(formatSchedule(weekdays({ byday: "MO", freq: "WEEKLY" }))).toBe(
        "Mon–Fri: 9 AM–5 PM",
      );
    });
  });

  describe("getOpenStatus", () => {
    // October 2026: Fridays are the 2nd, 9th, 16th, 23rd and 30th (EDT).
    const at = (isoLocal: string, offset = "-04:00") =>
      new Date(`${isoLocal}${offset}`);
    const secondFriday = { 5: [nineToFive({ byday: "2FR" })] };

    test.each<
      [string, YourPeerLegacyScheduleData, ScheduleData[], Date, string | null]
    >([
      [
        "on the 2nd Friday",
        secondFriday,
        [],
        at("2026-10-09T12:00:00"),
        "Open now · Closes at 5 PM",
      ],
      [
        "earlier that week",
        secondFriday,
        [],
        at("2026-10-05T12:00:00"),
        "Closed · Opens Friday at 9 AM",
      ],
      [
        "on the 3rd Friday, next opening is next month",
        secondFriday,
        [],
        at("2026-10-16T12:00:00"),
        "Closed · Opens Friday, November 13 at 9 AM",
      ],
      [
        "a 5th Friday is not the 4th",
        { 5: [nineToFive({ byday: "4FR" })] },
        [],
        at("2026-10-30T12:00:00"),
        "Closed · Opens Friday, November 27 at 9 AM",
      ],
      [
        "a 5th Friday is the last",
        { 5: [nineToFive({ byday: "-1FR" })] },
        [],
        at("2026-10-30T12:00:00"),
        "Open now · Closes at 5 PM",
      ],
      [
        "before the date range starts",
        weekdays({ valid_from: "2026-10-07" }),
        [],
        at("2026-10-05T12:00:00"),
        "Closed · Opens Wednesday at 9 AM",
      ],
      [
        "after the date range ends",
        weekdays({ valid_to: "2026-10-05" }),
        [],
        at("2026-10-06T12:00:00"),
        null,
      ],
      [
        "skips a closed month",
        weekdays(),
        [december],
        at("2026-11-30T18:00:00", "-05:00"),
        "Closed · Opens Friday, January 1 at 9 AM",
      ],
    ])("%s", (_, schedule, exceptions, now, expected) => {
      expect(getOpenStatus(schedule, now, exceptions)?.label ?? null).toBe(
        expected,
      );
    });
  });
});

// Week lists and Google-style special hours.
describe("week lists and special hours", () => {
  const nineToFive = (extra: Partial<ScheduleData> = {}): ScheduleData => ({
    ...hours("09:00:00", "17:00:00"),
    ...extra,
  });
  const weekdays = Object.fromEntries(
    MON_TO_FRI.map((day) => [day, [nineToFive()]]),
  );
  const special = (extra: Partial<ScheduleData>): ScheduleData => ({
    ...hours("", "", true),
    opens_at: null as unknown as string,
    closes_at: null as unknown as string,
    weekday: null,
    ...extra,
  });
  const christmas = special({
    valid_from: "2026-12-25",
    valid_to: "2026-12-25",
    description: "Christmas Day",
  });
  const newYearsEve = special({
    closed: false,
    opens_at: "10:00:00",
    closes_at: "14:00:00",
    valid_from: "2026-12-31",
    valid_to: "2026-12-31",
    description: "New Year's Eve",
  });

  test("the first two Fridays of the month", () => {
    expect(formatSchedule({ 5: [nineToFive({ byday: "1FR,2FR" })] })).toBe(
      "1st and 2nd Fridays of the month: 9 AM–5 PM",
    );
  });

  test("the first two weeks of the month", () => {
    const schedule = Object.fromEntries(
      MON_TO_FRI.map((day) => [
        day,
        [
          nineToFive({
            byday: ["1", "2"]
              .map((n) => `${n}${["MO", "TU", "WE", "TH", "FR"][day - 1]}`)
              .join(","),
          }),
        ],
      ]),
    );
    expect(formatSchedule(schedule)).toBe(
      "First and second weeks of the month: Mon–Fri 9 AM–5 PM",
    );
  });

  test("labelled special hours", () => {
    expect(formatSchedule(weekdays, [christmas, newYearsEve])).toBe(
      "Mon–Fri: 9 AM–5 PM. Closed December 25 (Christmas Day). December 31 (New Year's Eve): 10 AM–2 PM.",
    );
  });

  // December 2026 is EST (UTC-5). Dec 25 is a Friday, Dec 31 a Thursday.
  const at = (isoLocal: string) => new Date(`${isoLocal}-05:00`);

  test.each<[string, ScheduleData[], Date, string | null]>([
    [
      "closed on a holiday",
      [christmas],
      at("2026-12-25T12:00:00"),
      "Closed · Opens Monday at 9 AM",
    ],
    [
      "special hours replace the regular ones",
      [newYearsEve],
      at("2026-12-31T12:00:00"),
      "Open now · Closes at 2 PM",
    ],
    [
      "closed after the special hours end",
      [newYearsEve],
      at("2026-12-31T15:00:00"),
      "Closed · Opens tomorrow at 9 AM",
    ],
  ])("%s", (_, specialHours, now, expected) => {
    expect(getOpenStatus(weekdays, now, specialHours)?.label ?? null).toBe(
      expected,
    );
  });

  test("open on the 2nd of a two-Friday list", () => {
    // October 9, 2026 is the 2nd Friday (EDT).
    expect(
      getOpenStatus(
        { 5: [nineToFive({ byday: "1FR,2FR" })] },
        new Date("2026-10-09T12:00:00-04:00"),
      )?.label,
    ).toBe("Open now · Closes at 5 PM");
  });
});

describe("getScheduleNotes", () => {
  const withNote = (description: string | null): ScheduleData => ({
    ...hours("09:00:00", "17:00:00"),
    description,
  });
  const arriveBy = "Please come no later than 5 PM. Consider lining up early.";
  const supplies = "Distribution runs until food lasts.";

  test("a note on every open day stands alone", () => {
    const schedule = Object.fromEntries(
      MON_TO_FRI.map((day) => [day, [withNote(supplies)]]),
    );
    expect(getScheduleNotes(schedule)).toEqual([supplies]);
  });

  test("a note on some days names them", () => {
    expect(
      getScheduleNotes({
        1: [withNote(null)],
        3: [withNote(null)],
        5: [withNote(arriveBy)],
      }),
    ).toEqual([`Fri: ${arriveBy}`]);
  });

  test("no notes", () => {
    expect(getScheduleNotes({ 1: [withNote(null)] })).toEqual([]);
  });
});

describe("getDaySchedule", () => {
  const nineToFive = (extra: Partial<ScheduleData> = {}): ScheduleData => ({
    ...hours("09:00:00", "17:00:00"),
    ...extra,
  });
  const weekdays = Object.fromEntries(
    MON_TO_FRI.map((day) => [
      day,
      [nineToFive({ description: "Line up early." })],
    ]),
  );
  const thanksgiving: ScheduleData = {
    ...hours("", "", true),
    opens_at: null as unknown as string,
    closes_at: null as unknown as string,
    weekday: null,
    valid_from: "2026-11-26",
    valid_to: "2026-11-26",
    description: "Thanksgiving",
  };

  test("a regular day, with its notes", () => {
    expect(getDaySchedule(weekdays, [], "2026-11-02")).toEqual({
      date: "2026-11-02",
      hours: ["9 AM–5 PM"],
      intervals: [{ open: 540, close: 1020 }],
      special: null,
      notes: ["Line up early."],
    });
  });

  test("a closed weekend day", () => {
    expect(getDaySchedule(weekdays, [], "2026-11-07").hours).toEqual([]);
  });

  test("special hours replace the regular ones", () => {
    expect(getDaySchedule(weekdays, [thanksgiving], "2026-11-26")).toEqual({
      date: "2026-11-26",
      hours: [],
      intervals: [],
      special: { label: "Thanksgiving", closed: true },
      notes: [],
    });
  });

  test("only the matching weeks of the month", () => {
    const secondFriday = { 5: [nineToFive({ byday: "2FR" })] };
    expect(getDaySchedule(secondFriday, [], "2026-11-06").hours).toEqual([]);
    expect(getDaySchedule(secondFriday, [], "2026-11-13").hours).toEqual([
      "9 AM–5 PM",
    ]);
  });
});

describe("getRelevantHours", () => {
  // Breakfast, lunch and dinner on Mondays; November 2, 2026 is a Monday (EST).
  const meals = {
    1: [
      hours("08:00:00", "09:00:00"),
      hours("12:00:00", "13:00:00"),
      hours("17:00:00", "18:00:00"),
    ],
  };
  const monday = getDaySchedule(meals, [], "2026-11-02");
  const at = (time: string) => new Date(`2026-11-02T${time}-05:00`);

  test.each([
    ["before the first range", "07:00:00", "8–9 AM"],
    ["during a range", "12:30:00", "12–1 PM"],
    ["between ranges, the next one", "14:00:00", "5–6 PM"],
    ["after the last range, the last one", "20:00:00", "5–6 PM"],
  ])("today, %s", (_, time, expected) => {
    expect(getRelevantHours(monday, at(time))).toBe(expected);
  });

  test("another day shows its first range", () => {
    const nextMonday = getDaySchedule(meals, [], "2026-11-09");
    expect(getRelevantHours(nextMonday, at("14:00:00"))).toBe("8–9 AM");
  });

  test("a closed day has none", () => {
    expect(
      getRelevantHours(getDaySchedule(meals, [], "2026-11-03"), at("14:00:00")),
    ).toBeNull();
  });
});
