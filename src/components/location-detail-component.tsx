// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

"use client";

import {
  CATEGORIES,
  Comment,
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
import ReviewListItem from "@/components/feedback/review-list-item";
import { Authenticator } from "@aws-amplify/ui-react";

export function getIconPath(iconName: string): string {
  const hasExtension = /\.(png|jpg|jpeg|svg|gif|webp)$/i.test(iconName);
  const fileName = hasExtension ? iconName : `${iconName}.png`;
  return `/img/icons/${fileName}`;
}

const DISABLE_FEEDBACK = !!process.env.NEXT_PUBLIC_DISABLE_FEEDBACK;

export default function LocationDetailComponent({
  location,
  slug,
  comments,
}: {
  location: YourPeerLegacyLocationData;
  comments: Comment[];
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

      <ul className="hidden flex-col space-y-2 h-full overflow-y-auto pb-12">
        <Authenticator.Provider>
          {comments.map((comment) => (
            <ReviewListItem
              key={comment.id}
              comment={comment}
              isStuffUser={false}
              isAdmin={false}
              locationServices={servicesNames}
              orgName={location.name || "Unknown provider"}
            />
          ))}
        </Authenticator.Provider>
      </ul>

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
            orgName={location.name || "Unknown provider"}
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
          {!DISABLE_FEEDBACK ? (
            <LocationDetailNavigation currentSection={activeSection} />
          ) : undefined}

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

            {/*Review Highlight section*/}
            {!DISABLE_FEEDBACK ? (
              <div className="bg-neutral-50 pt-2" id="reviews">
                <div className="bg-white p-4 pt-8">
                  {location.name && (
                    <div className="bg-purple/10 rounded-lg px-4 py-3 flex space-x-2">
                      <img
                        src="/img/icons/group-users-icon.svg"
                        className="flex-shrink-0 w-6 h-6 object-contain"
                        alt=""
                      />
                      <div className="pr-6">
                        <p className="text-sm mb-2">
                          {location.partners
                            ? `YourPeer works with ${location.name} to collect community feedback.`
                            : "YourPeer partners with social service providers to collect community feedback."}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base text-grey-900">
                        Review highlights
                      </h3>
                      <button
                        className="text-blue text-sm"
                        onClick={() => setIsShowingReviewDetails(true)}
                      >
                        View all
                      </button>
                    </div>

                    <ReviewHighlights locationId={location.id} />

                    <div>
                      <button
                        onClick={() => setIsShowingReviewForm(true)}
                        className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full"
                      >
                        <PlusCircleIcon className="w-5 h-5 text-white" />
                        <span>Add review</span>
                      </button>
                      <button
                        onClick={() => setIsShowingReviewDetails(true)}
                        className="mt-3 flex items-center justify-center py-2 px-4 space-x-2 text-grey-900 font-medium bg-white border border-neutral-300 rounded-full w-full"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : undefined}

            <LocationServices location={location} />
          </div>
        </div>
      )}
    </LocationDetailContainer>
  );
}
