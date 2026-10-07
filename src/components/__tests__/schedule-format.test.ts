import { describe, test, expect } from "vitest";
import { formatSchedule, getOpenStatus } from "../schedule-format";
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
      "single day is plural",
      on([1], ["17:00:00", "18:00:00"]),
      "Open Mondays 5 PM to 6 PM",
    ],
    [
      "two days",
      on([1, 2], ["09:00:00", "17:00:00"]),
      "Open Mondays and Tuesdays 9 AM to 5 PM",
    ],
    [
      "weekday run",
      on(MON_TO_FRI, ["09:00:00", "17:00:00"]),
      "Open Monday to Friday 9 AM to 5 PM",
    ],
    [
      "every day",
      on(EVERY_DAY, ["09:00:00", "17:00:00"]),
      "Open every day 9 AM to 5 PM",
    ],
    [
      "one missing day inside a run",
      on([1, 2, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Open Monday to Saturday except Wednesdays 9 AM to 5 PM",
    ],
    [
      "six days missing Sunday",
      on([1, 2, 3, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Open Monday to Saturday 9 AM to 5 PM",
    ],
    [
      "six days missing midweek",
      on([1, 2, 4, 5, 6, 7], ["09:00:00", "17:00:00"]),
      "Open every day except Wednesdays 9 AM to 5 PM",
    ],
    [
      "weekdays except midweek",
      on([1, 2, 4, 5], ["09:00:00", "17:00:00"]),
      "Open Monday to Friday except Wednesdays 9 AM to 5 PM",
    ],
    [
      "discontinuous days",
      on([1, 2, 5, 6], ["09:00:00", "17:00:00"]),
      "Open Mondays, Tuesdays, Fridays and Saturdays 9 AM to 5 PM",
    ],
    [
      "short days plus a longer run",
      on([1, 4, 5, 6], ["09:00:00", "17:00:00"]),
      "Open Mondays and Thursday to Saturday 9 AM to 5 PM",
    ],
    [
      "weekend wraparound",
      on([6, 7, 1], ["10:00:00", "14:00:00"]),
      "Open Saturday to Monday 10 AM to 2 PM",
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
      "Open every day 7:30 AM to 9:30 AM, 11:30 AM to 1:30 PM and 5 PM to 7 PM",
    ],
    [
      "breaks within a day",
      on(
        MON_TO_FRI,
        ["09:00:00", "11:00:00"],
        ["12:00:00", "14:00:00"],
        ["15:00:00", "17:00:00"],
      ),
      "Open Monday to Friday 9 AM to 5 PM with breaks from 11 AM to 12 PM and 2 PM to 3 PM",
    ],
    [
      "a single break",
      on([3], ["09:00:00", "12:00:00"], ["13:00:00", "17:00:00"]),
      "Open Wednesdays 9 AM to 5 PM with a break from 12 PM to 1 PM",
    ],
    // Real schedules from the database (yourpeer.nyc#201).
    [
      "lunch break (new-york-city-bar-legal-referral-service-hells-kitchen)",
      on(MON_TO_FRI, ["08:30:00", "13:00:00"], ["14:00:00", "17:30:00"]),
      "Open Monday to Friday 8:30 AM to 5:30 PM with a break from 1 PM to 2 PM",
    ],
    [
      "two-hour gap is listed (boom-health-mott-haven)",
      on(MON_TO_FRI, ["09:00:00", "11:00:00"], ["13:00:00", "17:00:00"]),
      "Open Monday to Friday 9 AM to 11 AM and 1 PM to 5 PM",
    ],
    [
      "gap longer than the open period is listed (hamilton-madison-house-financial-district)",
      on(MON_TO_FRI, ["09:00:00", "09:30:00"], ["11:30:00", "12:30:00"]),
      "Open Monday to Friday 9 AM to 9:30 AM and 11:30 AM to 12:30 PM",
    ],
    [
      "meal times are listed (st-anns-corner-of-harm-reduction-sachr-longwood)",
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
      "Open Monday to Friday except Thursdays 9 AM to 11 AM, 1 PM to 3:30 PM and 5 PM to 6:30 PM; Thursdays 9 AM to 11 AM, 1 PM to 3 PM and 5 PM to 6:30 PM",
    ],
    [
      "overlapping rows are merged",
      on([3], ["09:00:00", "13:00:00"], ["12:00:00", "17:00:00"]),
      "Open Wednesdays 9 AM to 5 PM",
    ],
    [
      "overnight",
      on(MON_TO_FRI, ["21:00:00", "06:00:00"]),
      "Open Monday to Friday 9 PM to 6 AM the next day",
    ],
    [
      "closing at midnight",
      on([5], ["18:00:00", "23:59:00"]),
      "Open Fridays 6 PM to midnight",
    ],
    ["24/7", on(EVERY_DAY, ["00:00:00", "23:59:00"]), "Open 24/7"],
    [
      "all day on some days",
      on([6, 7], ["00:00:00", "23:59:00"]),
      "Open Saturdays and Sundays 24 hours",
    ],
    [
      "weekday and weekend hours, listed in weekly order",
      {
        ...on([6, 7], ["10:00:00", "14:00:00"]),
        ...on(MON_TO_FRI, ["09:00:00", "17:00:00"]),
      },
      "Open Monday to Friday 9 AM to 5 PM; Saturdays and Sundays 10 AM to 2 PM",
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
