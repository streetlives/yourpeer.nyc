// https://vercel.com/guides/react-context-state-management-nextjs

"use client";

import { useCookies } from "next-client-cookies";
import React, { createContext, useState } from "react";
import { Position } from "./common";
import { PreviousParams } from "./use-previous-params";
import { usePreviousParamsOnClient } from "./use-previous-params-client";

const NEXT_PUBLIC_GO_GETTA_PROD_URL = process.env.NEXT_PUBLIC_GO_GETTA_PROD_URL;

export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

export const GeoCoordinatesContext =
  createContext<GeoCoordinatesContextType | null>(null);

export type GeoCoordinatesContextType = {
  userPosition: Position | undefined;
  refreshUserPosition: (
    cb?: () => void,
    errBack?: (err: GeolocationPositionError | undefined) => void,
  ) => void;
};

function getFirstAddressComponent(
  results: google.maps.GeocoderResult[] | null,
  addressComponentType: string,
): string | undefined {
  return (results || [])
    .map((r) =>
      r.address_components
        .filter((ac) => ac.types.includes(addressComponentType))
        .map((ac) => ac.long_name),
    )
    .reduce((a, b) => a.concat(b), [])
    .pop();
}

function logGeoEvent(
  coords: Position,
  previousParams: PreviousParams | null,
): void {
  fetch(
    `${NEXT_PUBLIC_GO_GETTA_PROD_URL}/geocode/analytics/all?latitude=${coords.lat}&longitude=${coords.lng}`,
  )
    .then((response) => response.json())
    .then((geoAnalytics) => {
      // convert lat/lng to custom event
      const geocoder = new google.maps.Geocoder();
      const location = new google.maps.LatLng(coords.lat, coords.lng);
      // lookup neighborhood and borough from lat/lng
      // we need to get neighborhood and borough
      geocoder.geocode({ location }, (results, status) => {
        if (status == "OK") {
          // get the neighborhood
          const googleNeighborhood = getFirstAddressComponent(
            results,
            "neighborhood",
          );
          const googleBorough = getFirstAddressComponent(
            results,
            "sublocality",
          );
          const zipCode = getFirstAddressComponent(results, "postal_code");
          const {
            neighborhood,
            borough,
            districts: {
              school: schoolDistrict,
              congressional: congressionalDistrict,
              community: communityDistrict,
              state_assembly_district,
              state_assembly_district_water_areas,
              us_congressional_district,
              us_congressional_district_water_areas,
              state_senate_district,
              state_senate_district_water_areas,
              municipal_court_district,
              municipal_court_district_water_areas,
              city_council_district,
              city_council_district_water_areas,
              election_district,
              election_district_water_areas,
            },
          } = geoAnalytics;
          window["gtag"]("event", "geolocation", {
            googleNeighborhood,
            googleBorough,
            neighborhood,
            borough,
            zipCode,
            schoolDistrict,
            congressionalDistrict,
            communityDistrict,
            state_assembly_district,
            state_assembly_district_water_areas,
            us_congressional_district,
            us_congressional_district_water_areas,
            state_senate_district,
            state_senate_district_water_areas,
            municipal_court_district,
            municipal_court_district_water_areas,
            city_council_district,
            city_council_district_water_areas,
            election_district,
            election_district_water_areas,
            pathname: window.location.pathname,
            previousParamsRoute: previousParams?.params.route,
            previousParamsPersonalCareSubCategory:
              previousParams?.params.locationSlugOrPersonalCareSubCategory,
            previousParamsSearchParams: JSON.stringify(
              previousParams?.searchParams,
            ),
          });
        }
      });
    });
}

export const GeoCoordinatesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const cookies = useCookies();
  const previousParams = usePreviousParamsOnClient();
  const [userPosition, setUserPosition] = useState<Position>();
  function refreshUserPosition(
    cb?: () => void,
    errBack?: (err: GeolocationPositionError | undefined) => void,
  ) {
    cookies.remove("latitude");
    cookies.remove("longitude");
    window.navigator.geolocation.getCurrentPosition(
      (userPosition) => {
        const position: Position = {
          lat: userPosition.coords.latitude,
          lng: userPosition.coords.longitude,
        };
        logGeoEvent(position, previousParams);
        setUserPosition(position);
        cookies.set("latitude", userPosition.coords.latitude.toString());
        cookies.set("longitude", userPosition.coords.longitude.toString());
        // TODO: we want to change the selection to "nearby"
        // if the selection had not been previously explicitly set.
        if (cb) {
          cb();
        }
      },
      (error) => {
        console.log("unable to get user position", error);
        if (errBack) {
          errBack(error);
        }
      },
    );
  }
  return (
    <GeoCoordinatesContext.Provider
      value={{
        userPosition,
        refreshUserPosition,
      }}
    >
      {children}
    </GeoCoordinatesContext.Provider>
  );
};
