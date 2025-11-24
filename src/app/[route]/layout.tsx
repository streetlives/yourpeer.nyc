// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be f../../components/footerhe LICENSE file or at
// https://opensource.org/licenses/MIT.

import MapListToggleButton from "@/components/map-list-toggle-button";
import {
  COMPANY_ROUTES,
  CompanyRoute,
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

const SHOW_DONATION_BANNER = process.env.NEXT_PUBLIC_DONATION_BANNER === "true";

export default async function LocationsLayout(props: {
  mapContainer: React.ReactNode;
  sidePanel: React.ReactNode;
  staticPage: React.ReactNode;
  params: Promise<{ route: string }>;
}) {
  const params = await props.params;

  const { route } = params;

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
