"use client";

import { YourPeerLegacyLocationData } from "@/components/common";

function normalizeWebsiteUrl(url: string): string | undefined {
  if (url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
  }
  return url;
}

function renderNormalizedWebsiteUrl(url: string): string | undefined {
  const fullyQualifiedUrl = normalizeWebsiteUrl(url);
  if (fullyQualifiedUrl) {
    return fullyQualifiedUrl.replace(/^https?:\/\//, "");
  }
}

export default function LocationDetailInfo({
  location,
}: {
  location: YourPeerLegacyLocationData;
}) {
  return (
    <>
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
              <p className="text-dark mb-0.5 font-medium text-sm">Closed</p>
              {location.info?.map((info) => (
                <p
                  key={info}
                  className="text-dark font-normal text-sm"
                  dangerouslySetInnerHTML={{
                    __html: info,
                  }}
                ></p>
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
            <span translate="no">{location.city}</span>
            <span>,</span> <span translate="no">{location.zip}</span> <br />
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
        <span>
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
                <li translate="no" className="flex space-x-3 overflow-hidden">
                  <img
                    src="/img/icons/cursor.svg"
                    className="flex-shrink-0 w-5 h-5 max-h-5"
                    alt=""
                  />
                  <p className="text-dark text-sm ml-2">
                    <a
                      href={normalizeWebsiteUrl(location.url)}
                      target="_blank"
                      className="text-blue underline hover:no-underline cursor-pointer"
                    >
                      {renderNormalizedWebsiteUrl(location.url)}
                    </a>
                  </p>
                </li>
              ) : undefined}
            </>
          ) : undefined}
        </span>
      </ul>
    </>
  );
}
