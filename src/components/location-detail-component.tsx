// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  CATEGORIES,
  getServicesWrapper,
  LOCATION_ROUTE,
  YourPeerLegacyLocationData,
} from "./common";
import { useState } from "react";
import { ReportIssueForm } from "./report-issue";
import ReviewForm from "./feedback/review-form";
import ReviewList from "@/components/feedback/review-list";
import LocationDetailHeaderInfo from "@/components/location-detail/location-detail-header-info";
import LocationDetailNavigation from "@/components/location-detail/location-detail-navigation";
import StreetView from "@/components/location-detail/street-view";
import LocationDetailInfo from "@/components/location-detail/location-detail-info";
import ReviewHighlights from "@/components/feedback/review-highlights";
import LocationServices from "@/components/location-detail/location-services";
import LocationDetailContainer from "@/components/location-detail/location-detail-container";
import LocationDetailHeader from "@/components/location-detail/location-detail-header";
import { usePreviousRoute } from "./use-previous-route";
import { useRouter } from "next/navigation";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { EditIcon } from "@/components/icons/edit-icon";

export function getIconPath(iconName: string): string {
  return `/img/icons/${iconName}.png`;
}

export default function LocationDetailComponent({
  location,
  slug,
}: {
  location: YourPeerLegacyLocationData;
  slug: string;
}) {
  const [isShowingReviewDetails, setIsShowingReviewDetails] = useState(false);
  const [isShowingReviewForm, setIsShowingReviewForm] = useState(false);
  const [isShowingReportIssueForm, setIsShowingReportIssueForm] =
    useState(false);
  const [stickyTitle, setStickyTitle] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<
    "info" | "reviews" | "services"
  >("info");
  const router = useRouter();
  const previousRoute = usePreviousRoute();

  function hideReportIssueForm() {
    setIsShowingReportIssueForm(false);
  }

  const goBack = () => {
    if (
      isShowingReportIssueForm ||
      isShowingReviewDetails ||
      isShowingReviewForm
    ) {
      setIsShowingReportIssueForm(false);
      setIsShowingReviewDetails(false);
      setIsShowingReviewForm(false);
      return;
    }

    router.push(previousRoute ? previousRoute : `/${LOCATION_ROUTE}`);
  };

  const headerTitle = isShowingReviewDetails
    ? "Reviews"
    : isShowingReviewForm
      ? "Add review"
      : location.name;

  let servicesNames: string[] = [];

  CATEGORIES.map((serviceCategory) => {
    const servicesWrapper = getServicesWrapper(serviceCategory, location);
    const names = servicesWrapper?.services
      .map(({ name }) => name)
      .filter((name) => name !== null);
    servicesNames.push(...names);
  });

  return (
    <LocationDetailContainer
      onChangeSection={(section) => setActiveSection(section)}
      onSticky={(sticky) => setStickyTitle(sticky)}
    >
      <LocationDetailHeader
        onGoBack={goBack}
        title={headerTitle}
        isSticky={stickyTitle || isShowingReviewDetails || isShowingReviewForm}
      />

      {isShowingReportIssueForm ? (
        <ReportIssueForm
          location={location}
          hideReportIssueForm={hideReportIssueForm}
        />
      ) : isShowingReviewDetails ? (
        <div className="bg-neutral-100 flex flex-col h-full relative overflow-y-hidden pt-2">
          <ReviewList
            locationId={location.id}
            organizationId={location.organization_id || ""}
            location_services={servicesNames}
          />

          <div className=" absolute bottom-0 w-full bg-white px-5 py-2">
            <button
              onClick={() => {
                setIsShowingReviewDetails(false);
                setIsShowingReviewForm(true);
              }}
              className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full"
            >
              <PlusCircleIcon className="w-5 h-5 text-white" />
              <span>Add review</span>
            </button>
          </div>
        </div>
      ) : isShowingReviewForm ? (
        <ReviewForm
          locationId={location.id}
          provider={location.name || "Unknown provider"}
          onComplete={() => setIsShowingReviewForm(false)}
          services={servicesNames}
        />
      ) : (
        <div>
          <LocationDetailHeaderInfo
            name={location.name}
            locationName={location.location_name}
            area={location.area}
            lastUpdated={location.last_updated}
          />
          <LocationDetailNavigation currentSection={activeSection} />

          <div id="locationDetailsContainer">
            <StreetView location={location} />

            <div className="px-4 mt-5 pb-4 bg-white">
              <LocationDetailInfo location={location} />

              <div className="mt-5 flex gap-4">
                <Button
                  variant="outline"
                  className="rounded-full text-blue border-neutral-500 w-full"
                  size="lg"
                  onClick={() => setIsShowingReportIssueForm(true)}
                >
                  <EditIcon />
                  <span>Suggest an edit</span>
                </Button>
              </div>
            </div>

            <ReviewHighlights
              onAddReview={() => setIsShowingReviewForm(true)}
              onViewAll={() => setIsShowingReviewDetails(true)}
              locationId={location.id}
              provider={location.name}
            />
            <LocationServices location={location} />
          </div>
        </div>
      )}
    </LocationDetailContainer>
  );
}
