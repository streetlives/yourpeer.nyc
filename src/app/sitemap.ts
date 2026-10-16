// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import type { MetadataRoute } from "next";
import {
  fetchLocationsData,
  getSimplifiedLocationData,
} from "../components/streetlives-api-service";
import { hasServiceHours } from "../components/location-availability";
import {
  AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING,
  CATEGORY_TO_ROUTE_MAP,
  COMPANY_ROUTES,
  FullLocationData,
  LOCATION_ROUTE,
  PERSONAL_CARE_CATEGORY,
  RESOURCE_ROUTES,
} from "../components/common";

const ROOT_DOMAIN = "https://yourpeer.nyc";
export const dynamic = "force-dynamic";
const DEFAULT_CHANGE_FREQUENCY = "daily";
const DEFAULT_SITEMAP_PROPERTIES = {
  changeFrequency: DEFAULT_CHANGE_FREQUENCY,
  priority: 0.5,
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const simplifiedLocationData = await getSimplifiedLocationData({
    taxonomies: null,
    taxonomySpecificAttributes: null,
  });

  // New API responses expose availability without sending all service data.
  // During rollout, use a single full search rather than one request per slug.
  const indexableLocations = simplifiedLocationData.every(
    (location) => typeof location.has_service_hours === "boolean",
  )
    ? simplifiedLocationData.filter((location) => location.has_service_hours)
    : (
        await fetchLocationsData<FullLocationData>({
          taxonomies: null,
          location_fields_only: false,
        })
      ).locations.filter(hasServiceHours);

  return [
    {
      url: ROOT_DOMAIN,
      ...DEFAULT_SITEMAP_PROPERTIES,
    },
  ]
    .concat(
      RESOURCE_ROUTES.concat(COMPANY_ROUTES).map((topLevelRoute) => ({
        url: `${ROOT_DOMAIN}/${topLevelRoute}`,
        ...DEFAULT_SITEMAP_PROPERTIES,
      })),
    )
    .concat(
      AMENITIES_PARAM_SUBCATEGORY_AND_CANONICAL_ORDERING.map(
        (amenitySubCategory) => ({
          url: `${ROOT_DOMAIN}/${CATEGORY_TO_ROUTE_MAP[PERSONAL_CARE_CATEGORY]}/${amenitySubCategory}`,
          ...DEFAULT_SITEMAP_PROPERTIES,
        }),
      ),
    )
    .concat(
      indexableLocations
        .filter((d) => d.slug)
        .map((d) => ({
          url: `${ROOT_DOMAIN}/${LOCATION_ROUTE}/${d.slug}`,
          ...DEFAULT_SITEMAP_PROPERTIES,
        })),
    );
}
