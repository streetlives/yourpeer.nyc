// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { notFound } from "next/navigation";
import {
  RESOURCE_ROUTES,
  RouteParams,
  SearchParams,
} from "../../../components/common";
import LocationsMap from "../../../components/map";

import { getMapContainerData } from "../../../components/map-container-component";
import { cookies } from "next/headers";
import { redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet } from "@/components/navigation";
import { Error404Response } from "@/components/streetlives-api-service";

export default async function MapContainerPage(props: {
  searchParams: Promise<SearchParams>;
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  if (!RESOURCE_ROUTES.includes(params.route)) {
    return notFound();
  }

  try {
    redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet({
      searchParams,
      params,
      cookies: await cookies(),
    });

    return (
      <LocationsMap
        locationStubs={await getMapContainerData({
          searchParams,
          params,
        })}
      />
    );
  } catch (e) {
    if (e instanceof Error404Response) {
      return notFound();
    }

    return <LocationsMap locationStubs={[]} />;
  }
}
