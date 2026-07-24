"use client";

import { useViewStore } from "@/lib/store";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { LOCATION_ROUTE } from "./common";
import FiltersPopup from "./filters-popup";
import { MapLoadingAnimation } from "./map-loading-animation";

export function MainComponent({
  mapContainer,
  sidePanel,
}: {
  mapContainer: React.ReactNode;
  sidePanel: React.ReactNode;
}) {
  const showMapViewOnMobile = useViewStore(
    (state) => state.showMapViewOnMobile,
  );
  const setShowMapViewOnMobile = useViewStore(
    (state) => state.setShowMapViewOnMobile,
  );
  const currentPath = usePathname();
  const [, firstPathComponent, secondPathComponent] = currentPath.split("/");
  const isLocationDetailPage =
    firstPathComponent === LOCATION_ROUTE &&
    typeof secondPathComponent === "string";

  useEffect(() => {
    if (isLocationDetailPage && showMapViewOnMobile) {
      setShowMapViewOnMobile(false);
    }
  }, [isLocationDetailPage, setShowMapViewOnMobile, showMapViewOnMobile]);

  const classnames = classNames([
    "flex-1",
    "overflow-hidden",
    "flex",
    "flex-col",
    "md:flex-row",
    showMapViewOnMobile && !isLocationDetailPage
      ? "showMapOnMobile"
      : "hideMapOnMobile",
  ]);

  return (
    <main className={classnames}>
      <div
        className="relative w-full md:w-1/2 lg:w-1/3 bg-white overflow-hidden"
        id="left_panel"
      >
        <FiltersPopup />
        {sidePanel}
      </div>
      <div
        id="map_container"
        className="w-full md:block md:w-1/2 lg:w-2/3 bg-gray-300 flex-1 relative"
      >
        <Suspense fallback={<MapLoadingAnimation />}>{mapContainer}</Suspense>
      </div>
    </main>
  );
}
