import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_ICON_SRC_MAP,
  getIconPath,
  getServicesWrapper,
  YourPeerLegacyLocationData,
} from "./common";
import {
  fetchLocationsDetailData,
  map_gogetta_to_yourpeer,
} from "./streetlives-api-service";
import { type MouseEvent, useEffect, useState } from "react";
import { ServicesList } from "./locations-container";
import { useRouter } from "next/navigation";
import { useFilters, useViewStore } from "@/lib/store";

export function MobileTray({
  locationSlugClickedOnMobile,
  setLocationSlugClickedOnMobile,
}: {
  locationSlugClickedOnMobile: string;
  setLocationSlugClickedOnMobile: (
    locationSlugClickedOnMobile: string | undefined,
  ) => void;
}) {
  const [location, setLocation] = useState<YourPeerLegacyLocationData>();
  const [isLoading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const setDetailPanelLoading = useFilters(
    (state) => state.setDetailPanelLoading,
  );
  const setShowMapViewOnMobile = useViewStore(
    (state) => state.setShowMapViewOnMobile,
  );

  function handleLocationDetailNavigation(
    e: MouseEvent<HTMLAnchorElement>,
    slug: string,
  ) {
    e.preventDefault();
    setDetailPanelLoading(true);
    window.history.pushState(null, "", slug);
    router.push(slug);
  }

  useEffect(() => {
    setLoading(true);
    fetchLocationsDetailData(locationSlugClickedOnMobile).then((data) => {
      setLocation(map_gogetta_to_yourpeer(data, true));
      setLoading(false);
    });
  }, [locationSlugClickedOnMobile]);

  return (
    <div
      id="mobile_tray"
      className="p-5 fixed md:hidden bottom-0 inset-x-0 rounded-t-lg z-30 bg-white"
    >
      {isLoading || location === undefined ? (
        <div>Loading location data...</div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <h3 className="text-dark text-base font-medium notranslate">
              {location.name}
            </h3>
            <button
              className="text-dark ml-2"
              onClick={() => setLocationSlugClickedOnMobile(undefined)}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1" translate="no">
              {location.name}
            </p>
            <p className="flex items-center gap-x-1 text-xs text-neutral-500">
              <span translate="no" className="truncate">
                {location.area}
              </span>
              <span className="text-success truncate">
                {" "}
                <span>✓ Validated</span> <span>{location.last_updated}</span>
              </span>
            </p>
          </div>
          {location.closed ? (
            <div className="mt-3">
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
                  {location.info && location.info.length ? (
                    <p className="text-dark font-normal text-sm">
                      {location.info[0]}
                    </p>
                  ) : undefined}
                </div>
              </div>
            </div>
          ) : (
            <ul className="mt-3 flex gap-2 flex-col xl:pr-20">
              {CATEGORIES.map((serviceCategory) => {
                const servicesWrapper = getServicesWrapper(
                  serviceCategory,
                  location,
                );
                return servicesWrapper?.services.length ? (
                  <li
                    className="flex space-x-1.5 text-sm text-dark"
                    key={serviceCategory}
                  >
                    <img
                      src={getIconPath(CATEGORY_ICON_SRC_MAP[serviceCategory])}
                      className="flex-shrink-0 max-h-5"
                      alt=""
                    />
                    <p>
                      <ServicesList servicesWrapper={servicesWrapper} />
                    </p>
                  </li>
                ) : undefined;
              })}
            </ul>
          )}
          <div className="mt-3">
            <Link
              href={location.slug}
              onClick={(e) => handleLocationDetailNavigation(e, location.slug)}
              className="flex items-center space-x-2 text-sm text-info hover:text-blue-600 transition"
            >
              <span>More Details</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
