// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { getSidePanelComponentData } from "@/components/get-side-panel-component-data";
import {
  isOnLocationDetailPage,
  redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet,
} from "@/components/navigation";
import { getCookies } from "next-client-cookies/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  getParsedSubCategory,
  SearchParams,
  SubRouteParams,
} from "../../../../components/common";
import LocationDetailComponent from "../../../../components/location-detail-component";
import { SidePanelComponent } from "../../../../components/side-panel-component";
import {
  Error404Response,
  fetchComments,
  fetchLocationsDetailData,
  map_gogetta_to_yourpeer,
} from "../../../../components/streetlives-api-service";

export { generateMetadata } from "../../../../components/metadata";

export default async function LocationDetail(props: {
  params: Promise<SubRouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

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
        <SidePanelComponent
          searchParams={searchParams}
          sidePanelComponentData={await getSidePanelComponentData({
            searchParams,
            params,
            cookies: getCookies(),
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
      const comments = await fetchComments(location.id);

      return (
        <LocationDetailComponent
          location={location}
          slug={params.locationSlugOrPersonalCareSubCategory}
          comments={comments}
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
