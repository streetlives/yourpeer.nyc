// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { notFound } from "next/navigation";
import {
  getParsedSubCategory,
  SearchParams,
  SubRouteParams,
} from "../../../../components/common";
import LocationsMap from "../../../../components/map";
import {
  Error404Response,
  fetchLocationsDetailData,
} from "../../../../components/streetlives-api-service";
import { getMapContainerData } from "../../../../components/map-container-component";
import { getPreviousParams } from "@/components/get-previous-params";
import {
  isOnLocationDetailPage,
  redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet,
} from "@/components/navigation";
import { cookies } from "next/headers";

export default async function MapDetail(props: {
  searchParams: Promise<SearchParams>;
  params: Promise<SubRouteParams>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const previousParams = await getPreviousParams();

  try {
    if (!isOnLocationDetailPage(params)) {
      // validate
      getParsedSubCategory(params);
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
    } else {
      const location = await fetchLocationsDetailData(
        params.locationSlugOrPersonalCareSubCategory,
      );
      return (
        <LocationsMap
          locationStubs={
            previousParams
              ? await getMapContainerData(previousParams)
              : [location]
          }
          locationDetailStub={location}
        />
      );
    }
  } catch (e) {
    if (e instanceof Error404Response) {
      return notFound();
    } else {
      throw e; // rethrow the error to force a 500 response
    }
  }
}
