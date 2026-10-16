// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be f../../components/footerhe LICENSE file or at
// https://opensource.org/licenses/MIT.

import MapListToggleButton from "@/components/map-list-toggle-button";
import {
  COMPANY_ROUTES,
  CompanyRoute,
  LOCATION_ROUTE,
  RESOURCE_ROUTES,
} from "../../components/common";
import { Footer } from "../../components/footer";
import {
  LocationsNavbarCompanyRoutes,
  LocationsNavbarResourceRoutes,
} from "../../components/locations-navbar";
import { notFound } from "next/navigation";
import { MainComponent } from "@/components/main-component";
import GTranslateWrapper from "@/components/gtranslate-wrapper";
import { GeoCoordinatesProvider } from "@/components/geo-context";
import GTProdGuardScript from "@/components/gt-prod-guard-script";
import { headers } from "next/headers";
import {
  Error404Response,
  fetchLocationsDetailData,
} from "@/components/streetlives-api-service";

const SHOW_DONATION_BANNER = process.env.NEXT_PUBLIC_DONATION_BANNER === "true";

export default async function LocationsLayout(props: {
  mapContainer: React.ReactNode;
  sidePanel: React.ReactNode;
  staticPage: React.ReactNode;
  params: Promise<{ route: string }>;
}) {
  const params = await props.params;

  const { route } = params;

  // Validate before the parallel panels' loading boundaries can flush HTTP 200.
  // Middleware forwards the URL slug because parent layout params do not carry
  // child segments. The page loaders still validate client-side navigations.
  if (route === LOCATION_ROUTE) {
    const slug = (await headers()).get("x-yourpeer-location-slug");
    if (slug) {
      try {
        await fetchLocationsDetailData(decodeURIComponent(slug));
      } catch (error) {
        if (error instanceof Error404Response) notFound();
        throw error;
      }
    }
  }

  const { mapContainer, sidePanel, staticPage } = props;

  return (
    <>
      <GTProdGuardScript />
      <GTranslateWrapper />
      <span>
        {RESOURCE_ROUTES.includes(route) ? (
          <>
            <div className="h-[100vh] w-full">
              <GeoCoordinatesProvider>
                <MapListToggleButton />
                <div className="flex flex-col w-full h-full">
                  <div>
                    <LocationsNavbarResourceRoutes />
                  </div>
                  <MainComponent
                    mapContainer={mapContainer}
                    sidePanel={sidePanel}
                  />
                </div>
              </GeoCoordinatesProvider>
            </div>
          </>
        ) : COMPANY_ROUTES.includes(route as CompanyRoute) ? (
          <>
            <LocationsNavbarCompanyRoutes />
            <div className={`${SHOW_DONATION_BANNER ? "pt-14 lg:pt-16" : ""}`}>
              {staticPage}
            </div>
            <Footer />
          </>
        ) : (
          notFound()
        )}
      </span>
    </>
  );
}
