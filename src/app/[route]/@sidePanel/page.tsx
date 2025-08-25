// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import {
  RESOURCE_ROUTES,
  SearchParams,
  SubRouteParams,
} from "../../../components/common";

import { notFound } from "next/navigation";
import { SidePanelComponent } from "../../../components/side-panel-component";
import { getSidePanelComponentData } from "@/components/get-side-panel-component-data";
import { getCookies } from "next-client-cookies/server";
import { redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet } from "@/components/navigation";
import { cookies } from "next/headers";

export { generateMetadata } from "../../../components/metadata";

export default async function SidePanelPage({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: SubRouteParams;
}) {
  redirectIfNearbyAndIfLatitudeAndLongitudeIsNotSet({
    searchParams,
    params,
    cookies: cookies(),
  });
  return RESOURCE_ROUTES.includes(params.route) ? (
    <SidePanelComponent
      searchParams={searchParams}
      sidePanelComponentData={await getSidePanelComponentData({
        searchParams,
        params,
        cookies: getCookies(),
      })}
    />
  ) : (
    notFound()
  );
}
