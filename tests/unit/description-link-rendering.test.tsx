import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { AnchorHTMLAttributes, ReactElement } from "react";

vi.mock("next-client-cookies", () => ({ useCookies: vi.fn() }));
vi.mock("next/navigation", () => ({
  useParams: () => ({}),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock("@/lib/store", () => ({
  useFilters: (
    select: (state: { setDetailPanelLoading: () => void }) => unknown,
  ) => select({ setDetailPanelLoading: vi.fn() }),
}));
vi.mock("@/components/streetlives-api-service", () => ({
  Error404Response: class extends Error {},
}));
vi.mock("@/components/use-previous-params-client", () => ({
  usePreviousParamsOnClient: () => null,
}));
vi.mock("@/components/translatable-text", () => ({
  TranslatableText: ({ text }: { text: string }) => text,
}));
vi.mock("@/components/navigation", () => ({
  getUrlWithNewCategory: vi.fn(),
}));
vi.mock("@/components/locations-container-pager", () => ({
  LocationsContainerPager: () => null,
}));
vi.mock("@/components/sort-dropdown", () => ({ SortDropdown: () => null }));
vi.mock("@/components/location-detail/location-detail-loading-panel", () => ({
  default: () => null,
}));

import Service from "@/components/service-component";
import LocationDetailInfo from "@/components/location-detail/location-detail-info";
import LocationsContainer from "@/components/locations-container";
import { LanguageTranslationContext } from "@/components/language-translation-context";
import type {
  YourPeerLegacyLocationData,
  YourPeerLegacyServiceData,
} from "@/components/common";

const service: YourPeerLegacyServiceData = {
  id: "service-id",
  name: "Food pantry",
  description: '<a href="https://example.org/apply?x=1&amp;y=2#form">Apply</a>',
  category: null,
  subcategory: null,
  info: ['<a href="https://example.org/info">More info</a>'],
  closed: false,
  schedule: {},
  docs: null,
  referral_letter: null,
  eligibility: null,
  membership: null,
  age: null,
};

const location: YourPeerLegacyLocationData = {
  id: "location-id",
  location_name: "Pantry",
  organization_id: null,
  name: "Community organization",
  email: null,
  address: "123 Main St",
  city: "New York",
  region: null,
  state: "NY",
  zip: "10001",
  lat: 40.7,
  lng: -74,
  area: "Manhattan",
  info: ['<a href="https://example.org/closure">Closure details</a>'],
  slug: "/locations/community-organization",
  partners: false,
  last_updated: "Jan 1, 2026",
  last_updated_date: new Date("2026-01-01"),
  phones: null,
  url: null,
  streetview: null,
  photo: null,
  accommodation_services: { services: [] },
  food_services: { services: [service] },
  clothing_services: { services: [] },
  personal_care_services: { services: [] },
  health_services: { services: [] },
  other_services: { services: [] },
  legal_services: { services: [] },
  mental_health_services: { services: [] },
  employment_services: { services: [] },
  closed: true,
};

function renderHtml(element: ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <LanguageTranslationContext.Provider
      value={{ gTranslateCookie: null, setGTranslateCookie: vi.fn() }}
    >
      {element}
    </LanguageTranslationContext.Provider>,
  );
  return container;
}

describe("description link tracking in rendered locations", () => {
  it("tracks service descriptions and other info before hydration", () => {
    const html = renderHtml(
      <Service service={service} serviceCategory="food" startExpanded />,
    );
    expect(
      [...html.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ).toEqual([
      "https://example.org/apply?x=1&y=2&utm_source=yourpeer.nyc#form",
      "https://example.org/info?utm_source=yourpeer.nyc",
    ]);
    expect(service.description).not.toContain("utm_source");
    expect(service.info[0]).not.toContain("utm_source");
  });

  it("tracks other info on suspended services", () => {
    const html = renderHtml(
      <Service
        service={{ ...service, closed: true }}
        serviceCategory="food"
        startExpanded
      />,
    );
    expect(html.querySelector("a")?.getAttribute("href")).toBe(
      "https://example.org/info?utm_source=yourpeer.nyc",
    );
  });

  it("tracks every closure-info block in location details", () => {
    const html = renderHtml(
      <LocationDetailInfo
        location={{
          ...location,
          info: [
            ...location.info!,
            '<a href="https://yourpeer.nyc/food">Find food</a>',
          ],
        }}
      />,
    );
    expect(
      [...html.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ).toEqual([
      "https://example.org/closure?utm_source=yourpeer.nyc",
      "https://yourpeer.nyc/food",
    ]);
  });

  it.each([location, { ...location, info: [] }])(
    "renders closure info in search cards, including empty info arrays",
    (entry) => {
      const html = renderHtml(
        <LocationsContainer
          searchParams={{}}
          category="food"
          yourPeerLegacyLocationData={[entry]}
          resultCount={1}
          numberOfPages={1}
          currentPage={0}
        />,
      );
      const closureLink = [...html.querySelectorAll("a")].find(
        (a) => a.textContent === "Closure details",
      );
      expect(closureLink?.getAttribute("href")).toBe(
        entry.info?.length
          ? "https://example.org/closure?utm_source=yourpeer.nyc"
          : undefined,
      );
    },
  );
});
