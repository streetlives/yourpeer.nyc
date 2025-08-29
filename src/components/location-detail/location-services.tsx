"use client";

import {
  Category,
  CategoryNotNull,
  ROUTE_TO_CATEGORY_MAP,
  YourPeerLegacyLocationData,
  YourPeerLegacyServiceDataWrapper,
} from "@/components/common";
import { usePreviousRoute } from "@/components/use-previous-route";
import { usePreviousParamsOnClient } from "@/components/use-previous-params-client";
import {
  CATEGORIES,
  CATEGORY_DESCRIPTION_MAP,
  getServicesWrapper,
} from "../common";
import { TranslatableText } from "@/components/translatable-text";
import Service from "@/components/service-component";
import { getIconPath } from "@/components/location-detail-component";

const CATEGORY_ICON_SRC_MAP: Record<CategoryNotNull, string> = {
  "health-care": "health-icon",
  other: "other",
  "shelters-housing": "home-icon",
  food: "food-icon",
  clothing: "clothing-icon",
  "personal-care": "personal-care-icon",
  "legal-services": "services/legal-2.svg",
  "mental-health": "services/mental-health-2.svg",
  employment: "services/employment-2.svg",
};

function LocationService({
  serviceInfo,
  name,
  icon,
  startExpanded,
  serviceCategory,
}: {
  serviceInfo: YourPeerLegacyServiceDataWrapper;
  name: string;
  icon: string;
  startExpanded: boolean;
  serviceCategory: CategoryNotNull;
}) {
  return (
    <div className="bg-white rounded-lg">
      <div className="px-3 py-3 flex items-center space-x-2 border-b border-gray-200">
        <img
          src={getIconPath(icon)}
          className="flex-shrink-0 max-h-6 w-6 h-6"
          alt=""
        />
        <h3 className="text-dark text-lg font-medium leading-3">
          <TranslatableText text={name} />
        </h3>
      </div>
      <div className="flex flex-col divide-y divide-gray-200">
        {serviceInfo.services.map((service) => (
          <Service
            key={service.id}
            service={service}
            startExpanded={startExpanded}
            serviceCategory={serviceCategory}
          />
        ))}
      </div>
    </div>
  );
}

export default function LocationServices({
  location,
}: {
  location: YourPeerLegacyLocationData;
}) {
  const previousParams = usePreviousParamsOnClient();
  const previousCategory =
    ROUTE_TO_CATEGORY_MAP[previousParams?.params.route as string];
  const previousRoute = usePreviousRoute();
  console.log("previousRoute", previousRoute, previousParams);
  const previousSubcategory =
    previousParams?.params.locationSlugOrPersonalCareSubCategory;

  const previousCategoryAndSubcategoryAsCategory =
    previousSubcategory === "mental-health" ||
    previousSubcategory === "legal-services" ||
    previousSubcategory === "employment"
      ? (previousSubcategory as Category)
      : previousCategory;

  return !location.closed ? (
    <div
      id="services"
      className="px-4 py-5 bg-neutral-50 flex flex-col gap-y-4"
    >
      {(previousCategoryAndSubcategoryAsCategory
        ? [previousCategoryAndSubcategoryAsCategory].concat(
            CATEGORIES.filter(
              (category) =>
                category !== previousCategoryAndSubcategoryAsCategory,
            ),
          )
        : CATEGORIES
      ).map((serviceCategory) => {
        const servicesWrapper = getServicesWrapper(serviceCategory, location);
        return servicesWrapper?.services.length ? (
          <LocationService
            key={serviceCategory}
            serviceCategory={serviceCategory}
            serviceInfo={servicesWrapper}
            name={CATEGORY_DESCRIPTION_MAP[serviceCategory]}
            icon={CATEGORY_ICON_SRC_MAP[serviceCategory]}
            startExpanded={
              serviceCategory === previousCategoryAndSubcategoryAsCategory
            }
          />
        ) : undefined;
      })}
    </div>
  ) : undefined;
}
