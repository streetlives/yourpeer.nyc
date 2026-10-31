import { describe, expect, test, vi } from "vitest";

vi.mock("@/components/auth", () => ({
  getAuthToken: vi.fn(),
  getAuthPayload: vi.fn(),
}));

import locationDetailFixture from "../../../tests/fixtures/location-detail.json";
import { map_gogetta_to_yourpeer } from "@/components/streetlives-api-service";
import type {
  LocationDetailData,
  ScheduleData,
  YourPeerLegacyServiceData,
} from "@/components/common";
import { isOpenAt } from "../schedule-rules";
import {
  formatSchedule,
  getDaySchedule,
  getOpenStatus,
} from "../schedule-format";
import { cases } from "./schedule-cases.json";

// A holiday_schedules row as the API sends it, with times as HH:MM.
type CaseRow = {
  [column: string]: string | number | boolean | string[] | null | undefined;
  opens_at?: string;
  closes_at?: string;
};

// A New York local time like 2026-11-07T10:00, as an instant in the right
// DST offset.
function fromNyTime(localTime: string): Date {
  const guess = new Date(`${localTime}:00Z`);
  const asNy = new Date(
    guess.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const asUtc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(guess.getTime() + (asUtc.getTime() - asNy.getTime()));
}

// The food service yourpeer shows for a location whose service has `rows`,
// mapped the way the location page maps the API's response.
function serviceWith(rows: CaseRow[]): YourPeerLegacyServiceData {
  const base = locationDetailFixture as unknown as LocationDetailData;
  const location = {
    ...base,
    Services: base.Services.map((service) => ({
      ...service,
      HolidaySchedules: rows.map(
        (row) =>
          ({
            occasion: "COVID19",
            closed: false,
            weekday: null,
            ...row,
            opens_at: "opens_at" in row ? `${row.opens_at}:00` : null,
            closes_at: "closes_at" in row ? `${row.closes_at}:00` : null,
          }) as unknown as ScheduleData,
      ),
    })),
  };
  return map_gogetta_to_yourpeer(location, true).food_services.services[0];
}

// The cases the API's openAt search and gogetta are tested against too.
describe("schedule cases", () => {
  cases.forEach(({ name, rows, checks }) => {
    describe(name, () => {
      checks.forEach(({ at, open }) => {
        test(`the rules say ${open ? "open" : "closed"} at ${at}`, () => {
          const [date, time] = at.split("T");
          const [hours, minutes] = time.split(":").map(Number);
          expect(isOpenAt(rows, date, hours * 60 + minutes)).toBe(open);
        });

        test(`the location page says ${open ? "open" : "closed"} at ${at}`, () => {
          const service = serviceWith(rows);
          const status = getOpenStatus(
            service.schedule,
            fromNyTime(at),
            service.specialHours,
          );
          expect(status?.open ?? false).toBe(open);
        });
      });
    });
  });
});

const saturdays = {
  freq: "WEEKLY",
  byday: "SA",
  weekday: 6,
  opens_at: "09:00",
  closes_at: "17:00",
};

describe("formatSchedule with Google Calendar-style series", () => {
  const now = fromNyTime("2026-11-01T12:00");

  test("names new hours from a date", () => {
    const service = serviceWith([
      { ...saturdays, valid_to: "2026-11-30" },
      {
        ...saturdays,
        valid_from: "2026-12-01",
        opens_at: "10:00",
        closes_at: "14:00",
      },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Until November 30: Sat: 9 AM–5 PM. From December 1: Sat: 10 AM–2 PM",
    );
  });

  test("puts hours without dates first, and skipped dates in date order", () => {
    const service = serviceWith([
      { ...saturdays, valid_to: "2026-11-30", exdates: ["2026-11-28"] },
      {
        ...saturdays,
        valid_from: "2026-12-01",
        opens_at: "10:00",
        closes_at: "14:00",
      },
      {
        freq: "WEEKLY",
        byday: "FR",
        weekday: 5,
        opens_at: "22:00",
        closes_at: "02:00",
      },
      {
        closed: true,
        valid_from: "2026-11-26",
        valid_to: "2026-11-26",
        description: "Thanksgiving",
      },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Fri: 10 PM–2 AM (next day). Until November 30: Sat: 9 AM–5 PM. " +
        "From December 1: Sat: 10 AM–2 PM. " +
        "Closed November 26 (Thanksgiving) and November 28.",
    );
  });

  const weekdays = {
    freq: "WEEKLY",
    byday: "MO,TU,WE,TH,FR",
    opens_at: "09:00",
    closes_at: "17:00",
  };

  test("names closures that repeat", () => {
    const service = serviceWith([
      weekdays,
      {
        closed: true,
        freq: "YEARLY",
        bymonth: "12",
        bymonthday: "25",
        description: "Christmas Day",
      },
      {
        closed: true,
        freq: "YEARLY",
        bymonth: "11",
        byday: "4TH",
        description: "Thanksgiving",
      },
      {
        closed: true,
        freq: "YEARLY",
        bymonth: "8",
        bymonthday: Array.from({ length: 31 }, (_, i) => i + 1).join(","),
      },
      { closed: true, freq: "MONTHLY", byday: "-1FR" },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Mon–Fri: 9 AM–5 PM. Closed every December 25 (Christmas Day), " +
        "every 4th Thursday of November (Thanksgiving), all of August, " +
        "and the last Friday of every month.",
    );
    expect(
      getDaySchedule(service.schedule, service.specialHours!, "2026-11-26"),
    ).toMatchObject({
      hours: [],
      special: { label: "Thanksgiving", closed: true },
    });
    // Thanksgiving 2026 at 10 AM; Friday the 27th is the last Friday of the
    // month, so the next opening is Monday.
    expect(
      getOpenStatus(
        service.schedule,
        fromNyTime("2026-11-26T10:00"),
        service.specialHours,
      )?.label,
    ).toBe("Closed · Opens Monday at 9 AM");
  });

  test("names hours that run in some months only", () => {
    const service = serviceWith([weekdays, { ...saturdays, bymonth: "6,7,8" }]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Mon–Fri: 9 AM–5 PM. In June, July, and August: Sat: 9 AM–5 PM",
    );
  });

  test("leaves out a start date that has passed", () => {
    const service = serviceWith([
      {
        ...saturdays,
        weekday: 7,
        byday: "SU",
        interval: 2,
        valid_from: "2021-10-31",
      },
      { ...saturdays, valid_from: "2026-12-05" },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Every other week: Sun 9 AM–5 PM. From December 5: Sat: 9 AM–5 PM",
    );
  });

  test("lists coming skipped dates, and what's left of them", () => {
    const service = serviceWith([
      { ...saturdays, exdates: ["2026-10-31", "2026-11-14", "2026-11-21"] },
      {
        ...saturdays,
        opens_at: "18:00",
        closes_at: "20:00",
        exdates: ["2026-11-21"],
      },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "Sat: 9 AM–5 PM and 6–8 PM. Closed November 21. Except November 14: Open 6–8 PM.",
    );
  });

  test("describes days of the month", () => {
    const service = serviceWith([
      {
        freq: "MONTHLY",
        bymonthday: "15",
        opens_at: "09:00",
        closes_at: "17:00",
      },
    ]);
    expect(formatSchedule(service.schedule, service.specialHours, now)).toBe(
      "15th of the month: 9 AM–5 PM",
    );
    expect(
      getDaySchedule(service.schedule, service.specialHours!, "2026-11-15")
        .hours,
    ).toEqual(["9 AM–5 PM"]);
  });

  test("leaves skipped dates out of the calendar", () => {
    const service = serviceWith([{ ...saturdays, exdates: ["2026-11-14"] }]);
    expect(
      getDaySchedule(service.schedule, service.specialHours!, "2026-11-14")
        .hours,
    ).toEqual([]);
    expect(
      getDaySchedule(service.schedule, service.specialHours!, "2026-11-21")
        .hours,
    ).toEqual(["9 AM–5 PM"]);
  });
});
