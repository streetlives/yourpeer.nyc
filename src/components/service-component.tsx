// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useContext, useEffect, useState } from "react";
import {
  AgeEligibility,
  CategoryNotNull,
  YourPeerLegacyScheduleData,
  YourPeerLegacyServiceData,
} from "./common";
import { TranslatableText } from "./translatable-text";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "./language-translation-context";
import { usePreviousParamsOnClient } from "./use-previous-params-client";
import { useParams } from "next/navigation";

const moment = require("moment-strftime");

function formatAgeMaxSuffix(age_max: number): string {
  const remainder = age_max % 10;
  switch (remainder) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default function Service({
  service,
  startExpanded,
  serviceCategory,
}: {
  service: YourPeerLegacyServiceData;
  startExpanded: boolean;
  serviceCategory: CategoryNotNull;
}) {
  const previousParams = usePreviousParamsOnClient();
  const params = useParams();
  const [hasScrolled, setHasScrolled] = useState(false);

  const { gTranslateCookie } = useContext(
    LanguageTranslationContext,
  ) as LanguageTranslationContextType;

  const targetLanguage = gTranslateCookie
    ? getTargetLanguage(gTranslateCookie)
    : null;

  const [isExpanded, setIsExpanded] = useState<boolean>(startExpanded);
  //console.log('isExpanded', isExpanded)
  const hasSomethingToShow =
    service.description || service.info || service.docs || service.schedule;

  function logCustomAnalyticsEvent(isClickGoingToExpandService: boolean) {
    window["gtag"]("event", "location_detail_service_header_click", {
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory,
      isClickGoingToExpandService,
      pathname: window.location.pathname,
      previousParamsRoute: previousParams?.params.route,
      previousParamsPersonalCareSubCategory:
        previousParams?.params.locationSlugOrPersonalCareSubCategory,
      previousParamsSearchParams: JSON.stringify(previousParams?.searchParams),
    });
  }

  function toggleIsExpanded() {
    if (!service.closed) {
      const newState = !isExpanded;
      logCustomAnalyticsEvent(newState);
      setIsExpanded(newState);

      const hashText = "#" + convertString(service.name || "no name");

      window.history.replaceState(null, "", hashText);
    }
  }

  function renderAgeEligibility(ageReq: AgeEligibility) {
    let s = "";
    if (ageReq.age_min !== null && ageReq.age_max !== null) {
      const ageMaxPlusOne = ageReq["age_max"] + 1;
      s = `${ageReq["age_min"]}-${ageReq["age_max"]} ${
        targetLanguage === "ru"
          ? `(до того как Вам исполнится ${ageMaxPlusOne})`
          : `(until your ${ageMaxPlusOne}${formatAgeMaxSuffix(
              ageMaxPlusOne,
            )} birthday)`
      }`;
    } else if (ageReq.age_min !== null) {
      s = `${ageReq["age_min"]}+`;
    } else if (ageReq["age_max"] !== null) {
      s =
        targetLanguage === "ru"
          ? `Для доступа, Вам должно быть не более, чем ${ageReq["age_max"]}`
          : `'Under ${ageReq["age_max"]}'`;
    }

    return s;
  }

  function renderSchedule(schedule: YourPeerLegacyScheduleData): JSX.Element {
    const weekdays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    function day_number_to_name(weekday: number): string {
      return weekdays[weekday - 1];
    }

    function format_hour(time: string): string {
      if (time === "23:59:00" || time === "00:00:00") {
        return "midnight";
      }
      const minutes = parseInt(time.split(":")[1]);
      return moment(time, "hh:mm:ss").strftime(
        `%-I${minutes > 0 ? ":%M" : ""} %p`,
      );
    }

    function format_hours(opens: string, closes: string): string {
      return `${format_hour(opens)} to ${format_hour(closes)}`;
    }

    if (
      Object.keys(schedule).length === 7 &&
      Object.values(schedule).length === 7 &&
      Object.values(schedule)
        .flatMap((s) => s)
        .every(
          (schedule) =>
            schedule.opens_at === "00:00:00" &&
            schedule.closes_at === "23:59:00",
        )
    ) {
      return <TranslatableText text="Open 24/7" id="#service-component-Open" />;
    }

    // hour range string -> list of weekdays
    const days_grouped_by_hours: Record<string, number[]> = {};
    Object.entries(schedule).forEach(([weekday, hours]) => {
      hours.forEach((hour) => {
        const formattedHours = format_hours(hour.opens_at, hour.closes_at);
        if (!days_grouped_by_hours[formattedHours]) {
          days_grouped_by_hours[formattedHours] = [];
        }
        days_grouped_by_hours[formattedHours].push(parseInt(weekday, 10));
      });
    });

    const group_strings: string[] = Object.entries(days_grouped_by_hours).map(
      ([k, v]) => {
        const weekdays = v.sort();
        let weekdayStartEndGroups: [number, number][] = [];
        let endDayIndex = 0;
        let startDay = weekdays[endDayIndex];
        const lastDay = weekdays[weekdays.length - 1];
        if (weekdays.length === 1) {
          weekdayStartEndGroups.push([startDay, lastDay]);
        } else {
          let possibleEndDay = startDay;
          for (
            let endDayIndex = 1;
            endDayIndex < weekdays.length;
            endDayIndex++
          ) {
            if (weekdays[endDayIndex] === possibleEndDay + 1) {
              possibleEndDay = weekdays[endDayIndex];
            } else {
              // otherwise, end this group and start the next group
              weekdayStartEndGroups.push([startDay, possibleEndDay]);
              startDay = weekdays[endDayIndex];
              possibleEndDay = startDay;
            }
          }
          if (
            !weekdayStartEndGroups.length ||
            weekdayStartEndGroups[weekdayStartEndGroups.length - 1][0] !==
              startDay
          ) {
            weekdayStartEndGroups.push([startDay, possibleEndDay]);
          }
        }
        return `${weekdayStartEndGroups
          .map(([startDay, endDay]) =>
            startDay === endDay
              ? day_number_to_name(startDay)
              : `${day_number_to_name(startDay)} to ${day_number_to_name(endDay)}`,
          )
          .join(", ")}  ${k}`;
      },
    );

    return <span>{`Open ${group_strings.join("; ")}`}</span>;
  }

  useEffect(() => {
    if (!window.location.hash) {
      setHasScrolled(true);
    }
    if (window.location.hash && !hasScrolled) {
      const element = document.querySelector(window.location.hash);
      if (
        element &&
        "#" + convertString(service.name || "no name") == window.location.hash
      ) {
        setIsExpanded(true);
        element.scrollIntoView({ behavior: "smooth" });
        setHasScrolled(true);
      }
    }
  }, [params]);

  function convertString(input: string): string {
    return input.split(" ").join("-");
  }

  return (
    <div
      key={service.id}
      id={convertString(service.name || "No name")}
      className="flex items-start pl-3 pr-6 pt-2 pb-4 overflow-hidden relative"
    >
      {hasSomethingToShow && !service.closed ? (
        <button
          onClick={toggleIsExpanded}
          className="flex-shrink-0 collapseButton absolute left-3 top-2"
        >
          <img
            src="/img/icons/arrow-down.svg"
            className={`arrow w-7 h-7 object-contain max-h-7 transition ${isExpanded ? "" : "-rotate-90"}`}
            alt=""
          />
          <span className="absolute bg-transparent inset-y-0 left-0 -right-[500px]"></span>
        </button>
      ) : undefined}
      <div className="flex-1 pl-7">
        <h2
          className="text-dark text-base font-medium mt-0.5 cursor-pointer collapseButton relative"
          id="collapsible"
          onClick={toggleIsExpanded}
        >
          {service.name ? (
            <TranslatableText text={service.name} expectTranslation={false} />
          ) : undefined}
          {service.closed ? (
            <span className="text-danger"> (Suspended)</span>
          ) : undefined}
        </h2>
        {hasSomethingToShow && isExpanded ? (
          <div className="collapseContent overflow-hidden">
            <div
              className={
                !service.closed || service.info || service.description
                  ? "py-2"
                  : undefined
              }
            >
              {!service.closed ? (
                <div>
                  <>
                    {service.description ? (
                      <p
                        className="text-sm text-dark mb-4 have-links"
                        dangerouslySetInnerHTML={{
                          __html: service.description.replace(/•/g, "<br>•"),
                        }}
                      ></p>
                    ) : undefined}
                    <ul className="flex flex-col space-y-3">
                      {service.schedule ? (
                        <li className="flex items-start space-x-2">
                          <span className="text-success">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <p className="text-dark text-sm">
                            {renderSchedule(service.schedule)}
                          </p>
                        </li>
                      ) : undefined}
                      {service.info.map((info) => (
                        <li key={info} className="flex items-start space-x-2">
                          <span className="text-info">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <p
                            className="text-dark text-sm have-links service-info"
                            dangerouslySetInnerHTML={{
                              __html: info.replace(/•/g, "<br>•"),
                            }}
                          ></p>
                        </li>
                      ))}
                      <li className="flex items-start space-x-2">
                        {service.membership ||
                        service.eligibility?.every((item) => item) ||
                        service.docs?.length ||
                        service.age?.length ? (
                          <span className="text-danger">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : undefined}
                        <div>
                          {service.membership ? (
                            <p className="text-dark text-sm">
                              {" "}
                              <TranslatableText text="Only serves people who are clients of the organization" />
                            </p>
                          ) : undefined}
                          <span>
                            {service.eligibility
                              ? service.eligibility.map((item) => (
                                  <p key={item} className="text-dark text-sm">
                                    <span> {item} </span>
                                  </p>
                                ))
                              : undefined}
                          </span>
                          <span>
                            {service.docs?.length
                              ? service.docs.map((req) => (
                                  <p key={req} className="text-dark text-sm">
                                    {req === null ||
                                    req === "No documents required"
                                      ? "No proofs required"
                                      : `Requires ${req}`}
                                  </p>
                                ))
                              : ""}
                          </span>
                          {!service.age ||
                          (service.age?.length &&
                            service.age?.every((age) => age.all_ages)) ? (
                            <p className="text-dark text-sm">
                              <TranslatableText text="People of all ages are welcome" />
                            </p>
                          ) : service.age.length === 1 ? (
                            <p className="text-dark text-sm">
                              <TranslatableText text="Age requirement:" />{" "}
                              {renderAgeEligibility(service.age[0])}
                            </p>
                          ) : service.age.length > 1 ? (
                            <>
                              <p className="text-dark text-sm">
                                Age requirements:
                              </p>
                              <ul className="flex flex-col space-y-3">
                                {service.age.map((ageReq) => (
                                  <li
                                    key={JSON.stringify(ageReq)}
                                    className="flex items-start space-x-2"
                                  >
                                    <p className="text-dark text-sm">
                                      <span
                                        className={
                                          !targetLanguage ||
                                          targetLanguage === "en" ||
                                          targetLanguage === "ru"
                                            ? "notranslate"
                                            : ""
                                        }
                                        lang={targetLanguage || undefined}
                                      >
                                        {renderAgeEligibility(ageReq)}
                                      </span>{" "}
                                      {ageReq["population_served"] ? (
                                        <span>{`(${ageReq["population_served"]})`}</span>
                                      ) : undefined}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </>
                          ) : undefined}
                        </div>
                      </li>
                    </ul>
                  </>
                </div>
              ) : undefined}
            </div>
            <span>
              {service.closed && service.info.length
                ? service.info.map((info) => (
                    <li key={info} className="flex items-start space-x-2">
                      <span className="text-info">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <p
                        dangerouslySetInnerHTML={{ __html: info }}
                        className="text-dark text-sm have-links"
                      ></p>
                    </li>
                  ))
                : undefined}
            </span>
          </div>
        ) : undefined}
      </div>
    </div>
  );
}
