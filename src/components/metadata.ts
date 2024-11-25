// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

import { Metadata } from "next";
import {
  ABOUT_US_ROUTE,
  AMENITIES_PARAM_LAUNDRY_VALUE,
  AMENITIES_PARAM_RESTROOM_VALUE,
  AMENITIES_PARAM_SHOWER_VALUE,
  AMENITIES_PARAM_TOILETRIES_VALUE,
  CATEGORY_TO_ROUTE_MAP,
  CLOTHING_PARAM_CASUAL_VALUE,
  CLOTHING_PARAM_PROFESSIONAL_VALUE,
  CONTACT_US_ROUTE,
  DONATE_ROUTE,
  FOOD_PARAM_PANTRY_VALUE,
  FOOD_PARAM_SOUP_KITCHEN_VALUE,
  LOCATION_ROUTE,
  PAGE_PARAM,
  PRIVACY_POLICY_ROUTE,
  RouteParams,
  SHELTER_PARAM_FAMILY_VALUE,
  SHELTER_PARAM_SINGLE_VALUE,
  SubRouteParams,
  TERMS_OF_USE_ROUTE,
} from "./common";
import { fetchLocationsDetailData } from "./streetlives-api-service";

type Props = {
  params: RouteParams | SubRouteParams;
  searchParams: { [key: string]: string | string[] | undefined };
};

function attachSuffix(s: string): string {
  return `${s} | YourPeer`;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  let title, description;
  let subRouteParams = params as SubRouteParams;
  console.log(
    "subRouteParams.locationSlugOrPersonalCareSubCategory",
    subRouteParams.locationSlugOrPersonalCareSubCategory,
  );
  switch (params.route) {
    case LOCATION_ROUTE:
      if ((params as SubRouteParams).locationSlugOrPersonalCareSubCategory) {
        try {
          let locationDetailsResponse = await fetchLocationsDetailData(
            (params as SubRouteParams).locationSlugOrPersonalCareSubCategory,
          );
          title = attachSuffix(
            `${locationDetailsResponse.Organization.name} ${locationDetailsResponse.neighborhood ? `in ${locationDetailsResponse.neighborhood}` : ""}`,
          );
          description = locationDetailsResponse.Organization.name
            ? attachSuffix(locationDetailsResponse.Organization.name)
            : "";
        } catch (e) {
          console.error("Error fetching data in metadata", e);
        }
      } else {
        title = attachSuffix("All Locations");
        description =
          "See all locations hosted on YourPeer offering essential resources, shelters, food pantries, and more in NYC.";
      }
      break;
    case CATEGORY_TO_ROUTE_MAP["health-care"]:
      title = attachSuffix(
        "Free Healthcare Centers & Clinics For Unhoused People in NYC",
      );
      description =
        "Find healthcare services, centers, and clinics for unhoused (homeless) people in NYC. Use YourPeer’s support network to prioritize your health and well-being.";
      break;
    case CATEGORY_TO_ROUTE_MAP["other"]:
      title = attachSuffix(
        "Other Resources & Services For Unhoused People In NYC",
      );
      description =
        "Discover information about all resources and services offered by locations hosted on YourPeer in NYC. ";
      break;
    case CATEGORY_TO_ROUTE_MAP["shelters-housing"]:
      switch (subRouteParams.locationSlugOrPersonalCareSubCategory) {
        case null:
        case undefined:
          title = attachSuffix("Shelters & Housing Help for Unhoused (Homeless) People in NYC");
          description =
            "Find safe accommodation options for homeless people in NYC. Explore YourPeer’s resources to secure stable housing and support your journey to lasting stability.";
          break;
        case SHELTER_PARAM_SINGLE_VALUE:
          title = attachSuffix("Adult Housing For Unhoused People In NYC");
          description =
            "Discover housing and accomodations for unhoused adults in NYC at YourPeer. Our network of resources aim to provide safe housing options for adults experiencing homelessness.";
          break;
        case SHELTER_PARAM_FAMILY_VALUE:
          title = attachSuffix(
            "Family Shelters & Housing For Unhoused People In NYC",
          );
          description =
            "Find family shelters and housing for unhoused people in NYC. Explore all of our family resources to ensure your family's well-being and find the support you need.";
          break;
      }
      break;
    case CATEGORY_TO_ROUTE_MAP["food"]:
      switch (subRouteParams.locationSlugOrPersonalCareSubCategory) {
        case null:
        case undefined:
          title = attachSuffix("Food for Unhoused (Homeless) People in NYC");
          description =
            "Access food resources for homeless people in NYC through YourPeer. Find various food programs to stop hunger and get much-needed nourishment in times of need.";
          break;
        case FOOD_PARAM_PANTRY_VALUE:
          title = attachSuffix("Food Pantries For Unhoused People In NYC");
          description =
            "YourPeer connects unhoused people with local food pantries in NYC, providing sustenance during challenging times. Use YourPeer to find nearby food pantries offering food assistance.";
          break;
        case FOOD_PARAM_SOUP_KITCHEN_VALUE:
          title = attachSuffix("Soup Kitchens For Unhoused People In NYC");
          description =
            "Find soup kitchens and warm meals with YourPeer. Access nourishing meals and connect with caring communities through our comprehensive network of resources.";
          break;
      }
      break;
    case CATEGORY_TO_ROUTE_MAP["clothing"]:
      switch (subRouteParams.locationSlugOrPersonalCareSubCategory) {
        case null:
        case undefined:
          title = attachSuffix("Free Clothing for Unhoused (Homeless) People in NYC");
          description =
            "Find resources offering a range of free clothing options for unhoused (homeless) people in NYC with YourPeer. Get good seasonal and job interview clothing.";
          break;
        case CLOTHING_PARAM_CASUAL_VALUE:
          title = attachSuffix(
            "Free Casual Clothing For Unhoused People In NYC",
          );
          description =
            "Easily find locations and resources offering free casual clothing for unhoused individuals in NYC at YourPeer.";
          break;
        case CLOTHING_PARAM_PROFESSIONAL_VALUE:
          title = attachSuffix(
            "Free Professional Clothing For Unhoused People In NYC",
          );
          description =
            "Find locations and resources offering professional clothing for unhoused individuals in NYC at YourPeer.";
          break;
      }
      break;
    case CATEGORY_TO_ROUTE_MAP["personal-care"]:
      title = attachSuffix(
        "Personal Care Resources for Unhoused (Homeless) People in NYC",
      );
      description =
        "Find personal care resources for unhoused (homeless) people in NYC through YourPeer, including showers, laundry, toiletries, and more support services.";
      switch (subRouteParams.locationSlugOrPersonalCareSubCategory) {
        case AMENITIES_PARAM_LAUNDRY_VALUE:
          title = attachSuffix(
            "Free Laundry Services For Unhoused People In NYC",
          );
          description =
            "YourPeer connects unhoused individuals in NYC with free laundry services and locations. Explore our resources to find nearby laundry facilities.";
          break;
        case AMENITIES_PARAM_RESTROOM_VALUE:
          title = attachSuffix("Restrooms For Unhoused People In NYC");
          description =
            "YourPeer provides information on accessible restrooms in NYC for unhoused individuals. Discover safe and clean facilities to meet your restroom needs with our support.";
          break;
        case AMENITIES_PARAM_SHOWER_VALUE:
          title = attachSuffix("Showers For Unhoused People In NYC");
          description =
            "Find shower facilities for unhoused individuals in NYC at YourPeer. Access showers and hygiene resources  to help you stay clean and refreshed during challenging times.";
          break;
        case AMENITIES_PARAM_TOILETRIES_VALUE:
          title = attachSuffix("Toiletries For Unhoused People In NYC");
          description =
            "Find toiletries and hygiene essentials for unhoused individuals in NYC with YourPeer. Access resources to ensure you have the necessary items for personal care and well-being.";
          break;
      }
      break;
    case ABOUT_US_ROUTE:
      title = "About YourPeer";
      break;
    case CONTACT_US_ROUTE:
      title = attachSuffix("Feedback - Contact Us");
      break;
    case DONATE_ROUTE:
      title = attachSuffix("Donate");
      break;
    case TERMS_OF_USE_ROUTE:
      title = attachSuffix("Terms");
      break;
    case PRIVACY_POLICY_ROUTE:
      title = attachSuffix("Privacy");
      break;
    default:
      title = attachSuffix(
        "New York City Services & Resources For Unhoused People",
      );
  }
  // TODO: sitemap
  let canonicalPath = `/${params.route}${
    (params as SubRouteParams).locationSlugOrPersonalCareSubCategory
      ? `/${(params as SubRouteParams).locationSlugOrPersonalCareSubCategory}`
      : ""
  }${
    searchParams && searchParams[PAGE_PARAM]
      ? `?page=${searchParams[PAGE_PARAM]}`
      : ""
  }`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  };
}
