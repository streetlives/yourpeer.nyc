// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { notFound } from "next/navigation";
import {
  AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING,
  AmenitiesSubCategory,
  LAST_SET_PARAMS_COOKIE_NAME,
  PERSONAL_CARE_CATEGORY,
  SearchParams,
  SubRouteParams,
} from "../../../../components/common";
import {
  Error404Response,
  fetchLocationsDetailData,
  map_gogetta_to_yourpeer,
} from "../../../../components/streetlives-api-service";
import {
  getSidePanelComponentData,
  SidePanelComponent,
} from "../../../../components/side-panel-component";
import LocationDetailComponent from "../../../../components/location-detail-component";
import { cookies } from "next/headers";
import { usePreviousParams } from "@/components/use-previous-params";
import { getMapContainerData } from "@/components/map-container-component";

export { generateMetadata } from "../../../../components/metadata";

export default async function LocationDetail({
  params,
  searchParams,
}: {
  params: SubRouteParams;
  searchParams: SearchParams;
}) {
  const previousParams = usePreviousParams();
  try {
    if (
      params.route === PERSONAL_CARE_CATEGORY &&
      AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.includes(
        params.locationSlugOrPersonalCareSubCategory as AmenitiesSubCategory,
      )
    ) {
      return (
        <SidePanelComponent
          searchParams={searchParams}
          sidePanelComponentData={await getSidePanelComponentData({
            searchParams,
            params,
          })}
        />
      );
    } else {
      const location = map_gogetta_to_yourpeer(
        await fetchLocationsDetailData(
          params.locationSlugOrPersonalCareSubCategory,
        ),
        true,
      );

      return (
        <LocationDetailComponent
          location={location}
          locationStubs={
            previousParams
              ? await getMapContainerData(previousParams)
              : undefined
          }
          slug={params.locationSlugOrPersonalCareSubCategory}
        />
      );
    }
  } catch (e) {
    if (e instanceof Error404Response) {
      return notFound();
    }
  }
}
