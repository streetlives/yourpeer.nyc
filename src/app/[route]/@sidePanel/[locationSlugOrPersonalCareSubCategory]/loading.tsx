"use client";

import { LOCATION_ROUTE } from "@/components/common";
import LocationDetailLoadingSkeleton from "@/components/location-detail/location-detail-loading-skeleton";
import { SidebarLoadingAnimation } from "@/components/sidebar-loading-animation";
import { usePathname } from "next/navigation";

export default function Loading() {
  const currentPath = usePathname() as string;
  const [ignore, firstPathComponent, secondPathComponent] =
    currentPath.split("/");
  const isLocationDetailPage =
    firstPathComponent === LOCATION_ROUTE &&
    typeof secondPathComponent === "string";

  if (isLocationDetailPage) return <LocationDetailLoadingSkeleton />;
  return <SidebarLoadingAnimation />;
}
