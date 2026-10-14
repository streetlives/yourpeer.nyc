// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import { useContext, useEffect, useState, type JSX } from "react";
import {
  AgeEligibility,
  CategoryNotNull,
  YourPeerLegacyServiceData,
} from "./common";
import { TranslatableText } from "./translatable-text";
import {
  getTargetLanguage,
  LanguageTranslationContext,
  LanguageTranslationContextType,
} from "./language-translation-context";
import { usePreviousParamsOnClient } from "./use-previous-params-client";
import { markBreakableLinks } from "@/lib/break-links";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { formatSchedule, getOpenStatus } from "./schedule-format";

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
  // Set only on the client so the server render and hydration agree.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const openStatus = now ? getOpenStatus(service.schedule, now) : null;
  // if service is closed, check that service.info is non-empty
  // otherwise, check that description, info are non-empty
  // or that there are some docs required
  // or that there is a schedule we can describe
  const scheduleText = formatSchedule(service.schedule);
  const hasSomethingToShow = service.closed
    ? !!service.info.length
    : !!(
        service.description ||
        service.info.length ||
        service.docs?.filter((doc) => doc.trim() !== "None").length ||
        scheduleText
      );

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
    if (hasSomethingToShow) {
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
          : `under ${ageReq["age_max"]}`;
    }

    return s;
  }

  function renderSchedule(text: string): JSX.Element {
    if (text === "Open 24/7") {
      return <TranslatableText text="Open 24/7" id="#service-component-Open" />;
    }
    return <span>{text}</span>;
  }

  useEffect(() => {
    if (!window.location.hash) {
      setHasScrolled(true);
    }
    if (window.location.hash && !hasScrolled) {
      const elementId = window.location.hash.slice(1);
      const element = document.getElementById(elementId);
      if (element && convertString(service.name || "no name") == elementId) {
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
      {hasSomethingToShow ? (
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
                        className="text-sm text-dark mb-4 prose prose-a:text-blue break-links"
                        dangerouslySetInnerHTML={{
                          __html: markBreakableLinks(
                            service.description.replace(/•/g, "<br>•"),
                          ),
                        }}
                      ></p>
                    ) : undefined}
                    <ul className="flex flex-col space-y-3">
                      {scheduleText ? (
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
                          <div className="text-dark text-sm">
                            {openStatus ? (
                              <p
                                className={cn(
                                  "font-medium",
                                  openStatus.open && !openStatus.closingSoon
                                    ? "text-success"
                                    : "text-danger",
                                )}
                              >
                                {openStatus.label}
                              </p>
                            ) : undefined}
                            <p>{renderSchedule(scheduleText)}</p>
                          </div>
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
                            className="text-dark text-sm prose service-info prose-a:text-blue break-links"
                            dangerouslySetInnerHTML={{
                              __html: markBreakableLinks(
                                info.replace(/•/g, "<br>•"),
                              ),
                            }}
                          ></p>
                        </li>
                      ))}
                      <li className="flex items-start space-x-2">
                        {service.membership ||
                        service.eligibility?.some(Boolean) ||
                        service.docs?.some(Boolean) ||
                        service.age?.some(Boolean) ? (
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
                            {service.docs
                              ? service.docs.map((req) => (
                                  <p key={req} className="text-dark text-sm">
                                    {req === null ||
                                    req === "No documents required"
                                      ? "No documents required"
                                      : `Requires ${req}`}
                                  </p>
                                ))
                              : undefined}
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
                              <ul className="flex flex-col">
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
                                      </span>
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
                        dangerouslySetInnerHTML={{
                          __html: markBreakableLinks(info),
                        }}
                        className="text-dark text-sm prose prose-a:text-blue break-links"
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
