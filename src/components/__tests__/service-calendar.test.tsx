import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

vi.mock("@/components/translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => text,
}));
vi.mock("../translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => text,
}));

import ServiceCalendar from "../service-calendar";
import { ScheduleData } from "../common";

const row = (extra: Partial<ScheduleData>): ScheduleData =>
  ({
    id: "row",
    closed: false,
    opens_at: "09:00:00",
    closes_at: "17:00:00",
    start_date: null,
    end_date: null,
    weekday: null,
    occasion: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    location_id: null,
    service_id: null,
    service_at_location_id: null,
    ...extra,
  }) as ScheduleData;

// The 1st and 2nd Fridays of the month, closed on Thanksgiving.
const schedule = { 5: [row({ weekday: 5, byday: "1FR,2FR" })] };
const specialHours = [
  row({
    closed: true,
    opens_at: null as unknown as string,
    closes_at: null as unknown as string,
    valid_from: "2026-11-26",
    valid_to: "2026-11-26",
    description: "Thanksgiving",
  }),
];
// Monday, November 2, 2026, noon in New York.
const now = new Date("2026-11-02T12:00:00-05:00");

const renderCalendar = () =>
  render(
    <ServiceCalendar
      schedule={schedule}
      specialHours={specialHours}
      now={now}
    />,
  );

describe("ServiceCalendar", () => {
  it("shows the current month with each day's hours", () => {
    renderCalendar();

    expect(screen.getByText("November 2026")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Friday, November 6: 9 AM–5 PM" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Friday, November 20: Closed" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Thursday, November 26: Closed (Thanksgiving)",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Special hours")).toBeTruthy();
  });

  it("starts on today and shows a tapped day's details", () => {
    renderCalendar();
    expect(screen.getByText("Today:")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: /^Friday, November 13/ }),
    );
    expect(screen.getByText("Friday, November 13:")).toBeTruthy();
  });

  it("pages forward but not into the past", () => {
    renderCalendar();
    const previous = screen.getByRole("button", { name: "Previous month" });
    expect((previous as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("December 2026")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Friday, December 4: 9 AM–5 PM" }),
    ).toBeTruthy();
  });
});
