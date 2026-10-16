import type { AbstractDetailedLocationData } from "./common";

// Match the hours displayed by the service mapper. A closure-only record or
// location-level hours do not establish that any service has usable hours.
export function hasServiceHours(
  location: Pick<AbstractDetailedLocationData, "Services">,
): boolean {
  return (
    location.Services?.some((service) =>
      service.HolidaySchedules?.some(
        (schedule) => !!schedule.opens_at && !!schedule.closes_at,
      ),
    ) ?? false
  );
}
