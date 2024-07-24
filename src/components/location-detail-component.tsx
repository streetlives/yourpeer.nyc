// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  CATEGORIES,
  CATEGORY_DESCRIPTION_MAP,
  CategoryNotNull,
  LAST_SET_PARAMS_COOKIE_NAME,
  getServicesWrapper,
  LOCATION_ROUTE,
  SearchParams,
  SubRouteParams,
  YourPeerLegacyLocationData,
  YourPeerLegacyServiceDataWrapper,
} from "./common";
import Service from "./service-component";
import customStreetViews from "./custom-streetviews";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { activeMarkerIcon, defaultZoom, mapStyles } from "./map-common";
import { useEffect, useState } from "react";
import { ReportIssueForm } from "./report-issue";
import { parseCookies } from "./cookies";
import QuickExitLink from "./quick-exit-link";

export function getIconPath(iconName: string): string {
  return `/img/icons/${iconName}.png`;
}

const GOOGLE_MAPS_API_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
).toString();

function formatWebsiteUrl(url: string): string | undefined {
  if (url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
  }
  return url;
}

const CATEGORY_ICON_SRC_MAP: Record<CategoryNotNull, string> = {
  "health-care": "health-icon",
  other: "other",
  "shelters-housing": "home-icon",
  food: "food-icon",
  clothing: "clothing-icon",
  "personal-care": "personal-care-icon",
};

function LocationService({
  serviceInfo,
  name,
  icon,
}: {
  serviceInfo: YourPeerLegacyServiceDataWrapper;
  name: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg">
      <div className="px-3 py-3 flex items-center space-x-2 border-b border-gray-200">
        <img
          src={getIconPath(icon)}
          className="flex-shrink-0 max-h-6 w-6 h-6"
          alt=""
        />
        <h3 className="text-dark text-lg font-medium leading-3">{name}</h3>
      </div>
      <div className="flex flex-col divide-y divide-gray-200">
        {serviceInfo.services.map((service) => (
          <Service key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}

function serializeToQueryParams(searchParams: SearchParams): string {
  return Object.entries(searchParams)
    .map(([k, v]) =>
      typeof v === "string"
        ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        : "",
    )
    .join("&");
}

export default function LocationDetailComponent({
  location,
  slug,
}: {
  location: YourPeerLegacyLocationData;
  slug: string;
}) {
  const streetview =
    customStreetViews[slug] || `${location.lat},${location.lng}`;
  const [isShowingReportIssueForm, setIsShowingReportIssueForm] =
    useState(false);
  function hideReportIssueForm() {
    setIsShowingReportIssueForm(false);
  }

  const [previousRoute, setPreviousRoute] = useState<string>();
  useEffect(() => {
    const cookies = parseCookies();
    if (cookies[LAST_SET_PARAMS_COOKIE_NAME]) {
      const previousParams = JSON.parse(
        cookies[LAST_SET_PARAMS_COOKIE_NAME],
      ) as unknown as {
        searchParams: SearchParams;
        params: SubRouteParams;
      };
      setPreviousRoute(
        `/${previousParams.params.route}${previousParams.params.locationSlugOrPersonalCareSubCategory ? `/${previousParams.params.locationSlugOrPersonalCareSubCategory}` : ""}${Object.keys(previousParams).length ? `?${serializeToQueryParams(previousParams.searchParams)}` : ""}`,
      );
    }
  }, []);

  return (
    <div className="details-screen bg-white md:block z-50 sm:z-0 fixed md:absolute inset-0 w-full h-full overflow-y-auto scrollbar-hide">
      <div className="h-14 px-4 gap-x-2 flex justify-between md:justify-start items-center bg-white sticky top-0 left-0 w-full right-0">
        <a
          className="text-dark hover:text-black transition flex-shrink-0"
          id="details_back"
          href={previousRoute ? previousRoute : `/${LOCATION_ROUTE}`}
          style={{ cursor: "pointer" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </a>
        <QuickExitLink />
      </div>
      {isShowingReportIssueForm ? (
        <ReportIssueForm
          location={location}
          hideReportIssueForm={hideReportIssueForm}
        />
      ) : (
        <div id="locationDetailsContainer">
          <div className="px-4 pb-4 shadow">
            <h1
              className="text-dark text-lg sm:text-xl font-medium mt-3"
              x-text="$store.currentLocation.name"
              translate="no"
              id="location_name"
            >
              {location.name}
            </h1>

            <div className="mt-1">
              <p
                className="text-xs text-gray-500 mb-1"
                translate="no"
                x-text="$store.currentLocation.location_name"
              >
                {location.location_name}
              </p>
              <p className="flex items-center gap-x-1 text-xs text-gray-500">
                <span translate="no" className="truncate">
                  {location.area}
                </span>
                <span className="text-green truncate">✓</span>
                <span className="text-green truncate">
                  <span>
                    Validated <span> {location.last_updated} </span>
                  </span>
                </span>
              </p>
            </div>
          </div>
          {location.closed ? undefined : (
            <div>
              <div>
                <div className="w-full max-h-72 h-72 bg-neutral-100 overflow-hidden relative hidden md:block">
                  <img
                    src={`https://maps.googleapis.com/maps/api/streetview?size=600x500&key=${GOOGLE_MAPS_API_KEY}&fov=100&location=${streetview}`}
                    className="w-full h-full object-cover object-center cursor-pointer"
                    loading="lazy"
                  />
                  <a
                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=&viewpoint=${streetview}`}
                    target="_blank"
                    className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow-sm rounded-full px-5 py-2 text-dark font-medium text-sm"
                  >
                    View Street View
                  </a>
                </div>
              </div>
              <div className="w-full max-h-52 h-52 overflow-hidden relative md:hidden">
                <div id="miniMap" className="w-full h-full bg-neutral-100">
                  <APIProvider
                    apiKey={GOOGLE_MAPS_API_KEY}
                    libraries={["marker"]}
                  >
                    <Map
                      defaultZoom={defaultZoom}
                      gestureHandling={"greedy"}
                      zoomControl={false}
                      streetViewControl={false}
                      mapTypeControl={false}
                      fullscreenControl={false}
                      center={location}
                      styles={mapStyles}
                    >
                      <Marker
                        position={location}
                        title={location.name}
                        icon={activeMarkerIcon}
                      />
                    </Map>
                  </APIProvider>
                </div>
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetview}`}
                  target="_blank"
                  className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow rounded-full px-5 py-2 text-dark font-medium text-sm"
                >
                  View Street View
                </a>
              </div>
            </div>
          )}
          <div className="px-4 mt-5 pb-4 bg-white">
            {location.closed ? (
              <div className="mb-3">
                <div className="flex space-x-1.5">
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

                  <div>
                    <p className="text-dark mb-0.5 font-medium text-sm">
                      Closed
                    </p>
                    {location.info?.map((info) => (
                      <p key={info} className="text-dark font-normal text-sm">
                        {info}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : undefined}
            <ul className="flex flex-col space-y-4">
              <li className="flex space-x-3">
                <img
                  src="/img/icons/location.svg"
                  className="flex-shrink-0 w-5 h-5 max-h-5"
                  alt=""
                />
                <p className="text-dark text-sm ml-2">
                  <span translate="no">{location.address}</span> <br />
                  <span translate="no">{location.city}</span>,{" "}
                  <span translate="no">{location.zip}</span> <br />
                  {!location.closed ? (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${location.address},${location.city},${location.zip}`}
                      target="_blank"
                      className="text-blue underline hover:no-underline"
                    >
                      Get directions
                    </a>
                  ) : undefined}
                </p>
              </li>
              {!location.closed ? (
                <>
                  {location.phone ? (
                    <li translate="no" className="flex space-x-3">
                      <img
                        src="/img/icons/phone.svg"
                        className="flex-shrink-0 w-5 h-5 max-h-5"
                        alt=""
                      />
                      <p className="text-dark text-sm ml-2">
                        <a
                          href={`tel:${location.phone}`}
                          className="text-blue underline hover:no-underline"
                        >
                          {" "}
                          {location.phone}{" "}
                        </a>
                      </p>
                    </li>
                  ) : undefined}
                  {location.email ? (
                    <li translate="no" className="flex space-x-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-dark w-5 h-5 max-h-5 flex-shrink-0"
                      >
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                      </svg>
                      <p className="text-dark text-sm ml-2">
                        <a
                          href={`mailto:${location.email}`}
                          className="text-blue underline hover:no-underline"
                        >
                          {location.email}
                        </a>
                      </p>
                    </li>
                  ) : undefined}
                  {location.url ? (
                    <li
                      translate="no"
                      className="flex space-x-3 overflow-hidden"
                    >
                      <img
                        src="/img/icons/cursor.svg"
                        className="flex-shrink-0 w-5 h-5 max-h-5"
                        alt=""
                      />
                      <p className="text-dark text-sm ml-2">
                        <a
                          href={formatWebsiteUrl(location.url)}
                          target="_blank"
                          className="text-blue underline hover:no-underline cursor-pointer"
                        >
                          {formatWebsiteUrl(location.url)}
                        </a>
                      </p>
                    </li>
                  ) : undefined}
                </>
              ) : undefined}
            </ul>
            <div className="mt-5 flex gap-4">
              <a
                href={`mailto:yourpeer@streetlives.nyc?subject=Feedback on YourPeer Location ${location.name}`}
                className="text-xs flex-1 flex items-center justify-center py-1 px-5 space-x-2 text-dark transition hover:text-black hover:border-black border border-gray-300 rounded-3xl bg-neutral-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <span>Leave feedback</span>
              </a>
              <a
                href="#"
                id="reportIssueButton"
                className="text-xs flex-1 flex items-center justify-center py-1 px-5 space-x-2 text-dark transition hover:text-black hover:border-black border border-gray-300 rounded-3xl bg-neutral-50"
                onClick={() => setIsShowingReportIssueForm(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
                <span>Report Issue</span>
              </a>
            </div>
          </div>
          {!location.closed ? (
            <div className="px-4 py-5 bg-neutral-50 flex flex-col gap-y-4">
              {CATEGORIES.map((serviceCategory) => {
                const servicesWrapper = getServicesWrapper(
                  serviceCategory,
                  location,
                );
                return servicesWrapper?.services.length ? (
                  <LocationService
                    key={serviceCategory}
                    serviceInfo={servicesWrapper}
                    name={CATEGORY_DESCRIPTION_MAP[serviceCategory]}
                    icon={CATEGORY_ICON_SRC_MAP[serviceCategory]}
                  />
                ) : undefined;
              })}
            </div>
          ) : undefined}
        </div>
      )}
    </div>
  );
}
