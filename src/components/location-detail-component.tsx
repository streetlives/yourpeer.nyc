// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  LOCATION_ROUTE,
  SimplifiedLocationData,
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
import { MailIcon } from "@/components/icons/mail-icon";
import { ReportIcon } from "@/components/icons/report-icon";
import ReviewHighlights from "@/components/feedback/review-highlights";
import LocationServices from "@/components/location-detail/location-services";
import LocationDetailContainer from "@/components/location-detail/location-detail-container";
import LocationDetailHeader from "@/components/location-detail/location-detail-header";
import { usePreviousRoute } from "./use-previous-route";
import { useRouter } from "next/navigation";

export function getIconPath(iconName: string): string {
  return `/img/icons/${iconName}.png`;
}

export default function LocationDetailComponent({
  location,
  locationStubs,
  slug,
}: {
  location: YourPeerLegacyLocationData;
  locationStubs?: SimplifiedLocationData[];
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
        <ReviewList locationId={location.id} />
      ) : isShowingReviewForm ? (
        <ReviewForm
          locationId={location.id}
          provider={location.name || "Unknown provider"}
          onComplete={() => setIsShowingReviewForm(false)}
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
            <StreetView
              location={location}
              locationStubs={locationStubs}
              slug={slug}
            />

            <div className="px-4 mt-5 pb-4 bg-white">
              <LocationDetailInfo location={location} />

              <div className="mt-5 flex gap-4">
                <a
                  href={`mailto:yourpeer@streetlives.nyc?subject=Feedback on YourPeer Location ${location.name}`}
                  className="secondary-button"
                >
                  <MailIcon className="size-6" />
                  <span>Leave feedback</span>
                </a>
                <a
                  href="#"
                  id="reportIssueButton"
                  className="secondary-button"
                  onClick={() => setIsShowingReportIssueForm(true)}
                >
                  <ReportIcon className="size-6" />
                  <span>Report Issue</span>
                </a>
              </div>
            </div>

            <ReviewHighlights
              onAddReview={() => setIsShowingReviewForm(true)}
              onViewAll={() => setIsShowingReviewDetails(true)}
              locationId={location.id}
            />
            <LocationServices location={location} />
          </div>
        </div>
      )}
    </LocationDetailContainer>
  );
}
