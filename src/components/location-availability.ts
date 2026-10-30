import type { AbstractDetailedLocationData } from "./common";

// Directory eligibility is recorded service hours/status, not whether a service
// is open. An explicit closure or either time value keeps the location eligible.
export function hasServiceHours(
  location: Pick<AbstractDetailedLocationData, "Services">,
): boolean {
  return (
    location.Services?.some((service) =>
      service.HolidaySchedules?.some(
        (schedule) =>
          schedule.closed === true ||
          schedule.opens_at != null ||
          schedule.closes_at != null,
      ),
    ) ?? false
  );
}
