"use client";

import { usePathname } from "next/navigation";
import { LOCATION_ROUTE } from "./common";
import { Suspense } from "react";
import classNames from "classnames";
import { SidebarLoadingAnimation } from "./sidebar-loading-animation";
import { MapLoadingAnimation } from "./map-loading-animation";
import FiltersPopup from "./filters-popup";
import { useViewStore } from "@/lib/store";

export function MainComponent({
  mapContainer,
  sidePanel,
}: {
  mapContainer: React.ReactNode;
  sidePanel: React.ReactNode;
}) {
  const currentPath = usePathname() as string;
  const [ignore, firstPathComponent, secondPathComponent] =
    currentPath.split("/");
  const isLocationDetailPage =
    firstPathComponent === LOCATION_ROUTE &&
    typeof secondPathComponent === "string";

  const showMapViewOnMobile = useViewStore(
    (state) => state.showMapViewOnMobile,
  );

  const showMapView = showMapViewOnMobile && !isLocationDetailPage;

  const classnames = classNames([
    "flex-1",
    "overflow-hidden",
    "flex",
    "flex-col",
    "md:flex-row",
    showMapView ? "showMapOnMobile" : "hideMapOnMobile",
  ]);

  return (
    <main className={classnames}>
      <div
        className="relative w-full md:w-1/2 lg:w-1/3 bg-white overflow-hidden"
        id="left_panel"
      >
        <FiltersPopup />
        <Suspense fallback={<SidebarLoadingAnimation />}>{sidePanel}</Suspense>
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
