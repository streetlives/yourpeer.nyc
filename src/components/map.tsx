// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  LOCATION_ROUTE,
  NEARBY_SORT_BY_VALUE,
  Position,
  SEARCH_PARAM,
  SimplifiedLocationData,
  SORT_BY_QUERY_PARAM,
} from "./common";
import { useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { defaultZoom, mapStyles, myLocationIcon } from "./map-common";
import LocationStubMarker from "./location-stub-marker";
import { MobileTray } from "./mobile-tray";
import { SearchContext, SearchContextType } from "./search-context";
import { useCookies } from "next-client-cookies";
import { getUrlWithNewFilterParameter } from "./navigation";
import { useSearchParams } from "next/navigation";
import {
  GeoCoordinatesContext,
  GeoCoordinatesContextType,
} from "./geo-context";
import { useFilters } from "@/lib/store";

function isMobile(): boolean {
  return window.innerWidth <= 768;
}

const MAX_NUM_LOCATIONS_TO_INCLUDE_IN_BOUNDS = 5;

const GOOGLE_MAPS_API_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
).toString();

const centralPark: Position = {
  lat: 40.782539,
  lng: -73.965602,
};

function calculateDistanceInMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusMiles = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusMiles * c;

  return distance;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

interface SimplifiedLocationDataWithDistance extends SimplifiedLocationData {
  distanceMiles: number;
}

// this exists because useMap hook must be inside of APIWrapper in order to work
function MapWrapper({
  locationStubs,
  locationDetailStub,
  locationSlugClickedOnMobile,
  locationStubClickedOnMobile,
  setLocationSlugClickedOnMobile,
}: {
  locationStubs?: SimplifiedLocationData[];
  locationDetailStub?: SimplifiedLocationData;
  locationSlugClickedOnMobile?: string;
  locationStubClickedOnMobile?: SimplifiedLocationData;
  setLocationSlugClickedOnMobile: (slug: string | undefined) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cookies = useCookies();
  const cookieZoom = cookies.get("zoom");
  const cookieMapCenter = cookies.get("mapCenter");

  const { refreshUserPosition, userPosition } = useContext(
    GeoCoordinatesContext,
  ) as GeoCoordinatesContextType;

  const normalizedLocationDetailStub =
    locationStubClickedOnMobile || locationDetailStub;
  const normalizedLocationStubs =
    normalizedLocationDetailStub &&
    locationStubs &&
    !locationStubs
      .map((stub) => stub.id)
      .includes(normalizedLocationDetailStub.id)
      ? [normalizedLocationDetailStub].concat(locationStubs)
      : locationStubs;

  const router = useRouter();
  const [zoom, setZoom] = useState<number>(
    locationSlugClickedOnMobile && cookieZoom
      ? parseInt(cookieZoom)
      : defaultZoom,
  );
  const [mapCenter, setMapCenter] = useState<Position>(
    locationSlugClickedOnMobile && cookieMapCenter
      ? (JSON.parse(cookieMapCenter) as Position)
      : locationDetailStub
        ? {
            lat: locationDetailStub.position.coordinates[1],
            lng: locationDetailStub.position.coordinates[0],
          }
        : centralPark,
  );
  const [lastImportantCenter, setLastImportantCenter] = useState<Position>();
  const [lastImportantZoom, setLastImportantZoom] = useState<number>();
  const googleMap = useMap();
  const closFilters = useFilters((state) => state.close);

  function getUserPositionOrCentralPark(): Position {
    if (!userPosition) return centralPark;

    const distanceInMiles = calculateDistanceInMiles(
      userPosition.lat,
      userPosition.lng,
      centralPark.lat,
      centralPark.lng,
    );

    return distanceInMiles > 26 ? centralPark : userPosition;
  }

  function centerTheMap(): void {
    const normalizedUserPosition = getUserPositionOrCentralPark();
    if (googleMap) {
      if (normalizedLocationDetailStub) {
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(normalizedUserPosition));
        bounds.extend(
          new google.maps.LatLng(
            normalizedLocationDetailStub.position.coordinates[1],
            normalizedLocationDetailStub.position.coordinates[0],
          ),
        );
        googleMap.fitBounds(bounds);
      } else {
        googleMap.panTo(normalizedUserPosition);
      }
    }
  }

  function handleClickOnLocationStubMarker(
    locationStub: SimplifiedLocationData,
  ) {
    const pageWidth = document.documentElement.scrollWidth;
    closFilters();

    if (!isMobile()) {
      router.push(`/${LOCATION_ROUTE}/${locationStub.slug}`);
    } else if (setLocationSlugClickedOnMobile) {
      setLocationSlugClickedOnMobile(locationStub.slug);
      setLastImportantCenter(mapCenter);
      setLastImportantZoom(zoom);

      googleMap?.panTo({
        lat: locationStub.position.coordinates[1],
        lng: locationStub.position.coordinates[0],
      });
    }
  }

  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => {
      const googleMapDiv = ev.map.getDiv();

      // if google map is already hidden, then ignore the event, because we get a weird zoom
      if (
        !googleMapDiv ||
        (googleMapDiv.clientHeight === 0 && googleMapDiv.clientWidth === 0)
      )
        return;

      //console.log("camera changed: ", ev.detail);
      const newCenter = ev.detail.center;
      console.log("newCenter", newCenter);
      if (
        newCenter.lat !== 0 &&
        newCenter.lng !== 0 &&
        (mapCenter.lat !== newCenter.lat || mapCenter.lng !== newCenter.lng)
      ) {
        console.log("setMapCenter(newCenter);", newCenter);
        setMapCenter(newCenter);
      }

      const newZoom = ev.detail.zoom;
      console.log("newZoom ", newZoom);
      if (newZoom && newZoom !== zoom) {
        console.log("setZoom(newZoom);", newZoom);
        setZoom(newZoom);
      }
    },
    [mapCenter, setMapCenter, zoom, setZoom],
  );

  const { showMapViewOnMobile } = useContext(
    SearchContext,
  ) as SearchContextType;

  useEffect(() => {
    cookies.set("zoom", JSON.stringify(zoom));
  }, [zoom]);

  useEffect(() => {
    cookies.set("mapCenter", JSON.stringify(mapCenter));
  }, [mapCenter]);

  // FIXME: we might not actually need this?
  useEffect(() => {
    if (showMapViewOnMobile && googleMap) {
      console.log("set initial mapCenter, zoom", mapCenter, zoom);
      googleMap.setCenter(mapCenter);
      googleMap.setZoom(zoom);
    }
  }, [showMapViewOnMobile, googleMap]);

  // TODO: when the page first loads, get the user's current position
  useEffect(() => {
    refreshUserPosition(() => {
      // if the SORT_BY_QUERY_PARAM is not set,
      // then by default route to nearby
      const sortBy = searchParams?.get(SORT_BY_QUERY_PARAM);
      const searchText = searchParams?.get(SEARCH_PARAM);
      if (!sortBy && !locationDetailStub && !searchText) {
        router.push(
          getUrlWithNewFilterParameter(
            pathname,
            searchParams,
            SORT_BY_QUERY_PARAM,
            NEARBY_SORT_BY_VALUE,
          ),
        );
      }
    });
  }, []);

  // when we get new locationStubs AND the user's location is set,
  // then pan/zoom the map to contain 25 locations
  // FIXME: do we want to set a maximum distance?
  useEffect(() => {
    const normalizedUserPosition = getUserPositionOrCentralPark();

    if (normalizedLocationDetailStub) return; // if locationDetailStub is set, then he should be the center

    if (locationStubs && locationStubs.length) {
      const simplifiedLocationDataWithDistance: SimplifiedLocationDataWithDistance[] =
        locationStubs
          .map((locationStub) => ({
            ...locationStub,
            distanceMiles: calculateDistanceInMiles(
              normalizedUserPosition.lat,
              normalizedUserPosition.lng,
              locationStub.position.coordinates[1],
              locationStub.position.coordinates[0],
            ),
          }))
          .sort((a, b) => a.distanceMiles - b.distanceMiles);
      const closest25Locations = simplifiedLocationDataWithDistance.slice(
        0,
        Math.min(
          simplifiedLocationDataWithDistance.length,
          MAX_NUM_LOCATIONS_TO_INCLUDE_IN_BOUNDS,
        ),
      );

      if (googleMap) {
        var bounds = new google.maps.LatLngBounds();
        closest25Locations.forEach(function (loc) {
          var latLng = new google.maps.LatLng(
            loc.position.coordinates[1],
            loc.position.coordinates[0],
          );
          bounds.extend(latLng);
        });
        // make sure user position is shown on the map if he is within 26 miles of central park, otherwise ignore him
        bounds.extend(
          new google.maps.LatLng(
            normalizedUserPosition.lat,
            normalizedUserPosition.lng,
          ),
        );
        googleMap.fitBounds(bounds);
      }
    }
  }, [userPosition, locationStubs, googleMap, showMapViewOnMobile]);

  return (
    <>
      <Map
        defaultZoom={zoom}
        gestureHandling={"greedy"}
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        center={mapCenter}
        onCameraChanged={handleCameraChange}
        styles={mapStyles}
      >
        <span>
          {normalizedLocationStubs
            ? normalizedLocationStubs.map((locationStub) => (
                <LocationStubMarker
                  locationStub={locationStub}
                  key={locationStub.id}
                  locationSlugClickedOnMobile={
                    normalizedLocationDetailStub?.slug
                  }
                  handleClickOnLocationStubMarker={
                    handleClickOnLocationStubMarker
                  }
                />
              ))
            : undefined}
        </span>
        {userPosition ? (
          <Marker
            position={userPosition}
            clickable={false}
            title="You are here!"
            icon={myLocationIcon}
          />
        ) : undefined}
      </Map>

      <div
        id="recenter-btn"
        onClick={centerTheMap}
        className="absolute top-2 right-2 z-[1] bg-white/95 flex items-center justify-center cursor-pointer w-9 h-9 rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="19"
          viewBox="0 0 19 19"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.0294 0.0566351L0.413683 7.84112C0.144651 7.96016 -0.0198463 8.23615 0.00343285 8.52942C0.026712 8.82269 0.232687 9.06927 0.517131 9.14438L7.12859 10.8845C7.6114 11.0114 7.98859 11.3883 8.11596 11.871L9.85611 18.4824C9.93099 18.767 10.1774 18.9732 10.4707 18.9967C10.764 19.0202 11.0402 18.8558 11.1594 18.5868L18.9402 0.971044C19.0552 0.709941 18.9985 0.404985 18.7971 0.202812C18.5957 0.000638069 18.291 -0.0573878 18.0294 0.0566351Z"
            fill="#5A87FF"
          />
        </svg>
      </div>
    </>
  );
}

export default function LocationsMap({
  locationStubs,
  locationDetailStub,
}: {
  locationStubs?: SimplifiedLocationData[];
  locationDetailStub?: SimplifiedLocationData;
}) {
  const cookies = useCookies();
  const cookieLocationSlugClickedOnMobile = cookies.get(
    "locationSlugClickedOnMobile",
  );

  const [locationSlugClickedOnMobile, setLocationSlugClickedOnMobile] =
    useState<string | undefined>(cookieLocationSlugClickedOnMobile);
  const [locationStubClickedOnMobile, setLocationStubClickedOnMobile] =
    useState<SimplifiedLocationData>();

  useEffect(() => {
    if (locationSlugClickedOnMobile) {
      if (
        cookies.get("locationSlugClickedOnMobile") !==
        locationSlugClickedOnMobile
      ) {
        cookies.set("locationSlugClickedOnMobile", locationSlugClickedOnMobile);
      }
    } else {
      cookies.remove("locationSlugClickedOnMobile");
    }
  }, [locationSlugClickedOnMobile]);

  useEffect(() => {
    const newLocationStub = locationStubs
      ?.filter(
        (locationStub) => locationStub.slug === locationSlugClickedOnMobile,
      )
      .pop();
    setLocationStubClickedOnMobile(newLocationStub);
    if (!newLocationStub) {
      // clear all of the cookies
      cookies.remove("locationSlugClickedOnMobile");
      cookies.remove("zoom");
      cookies.remove("mapCenter");
    }
  }, [locationStubs, locationSlugClickedOnMobile]);

  function checkIfIsMobile(): void {
    if (!isMobile()) {
      setLocationSlugClickedOnMobile(undefined);
      cookies.remove("locationSlugClickedOnMobile");
    }
  }

  useEffect(() => {
    checkIfIsMobile();
    function resizeListener() {
      checkIfIsMobile();
    }
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return (
    <>
      <div id="map" className="w-full h-full">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["marker"]}>
          <MapWrapper
            locationStubs={locationStubs}
            locationDetailStub={locationDetailStub}
            locationStubClickedOnMobile={locationStubClickedOnMobile}
            setLocationSlugClickedOnMobile={setLocationSlugClickedOnMobile}
            locationSlugClickedOnMobile={locationSlugClickedOnMobile}
          />
        </APIProvider>
      </div>
      {locationStubClickedOnMobile ? (
        <MobileTray
          locationSlugClickedOnMobile={locationStubClickedOnMobile?.slug}
          setLocationSlugClickedOnMobile={setLocationSlugClickedOnMobile}
        />
      ) : undefined}
    </>
  );
}
