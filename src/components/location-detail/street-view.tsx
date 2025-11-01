"use client";

import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import {
  activeMarkerIcon,
  defaultZoom,
  mapStyles,
} from "@/components/map-common";
import LocationStubMarker from "@/components/location-stub-marker";
import {
  Position,
  SimplifiedLocationData,
  YourPeerLegacyLocationData,
} from "@/components/common";
import { useCallback, useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
).toString();

function trimLocationFromSlug(path: string) {
  const parts = path.split("/");
  if (parts.length > 2 && parts[1] === "locations") {
    return parts.slice(2).join("/");
  }
  return path.startsWith("/") ? path.slice(1) : path;
}

interface StreetViewData {
  lat?: number;
  lng?: number;
  heading?: number;
  pitch?: number;
  fov?: number;
  pano?: string;
}

function extractStreetViewData(url: string | null): StreetViewData | null {
  if (!url) return null;
  const result: StreetViewData = {};

  // Lat and Lng after @lat,lng
  const latLngMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (latLngMatch) {
    result.lat = parseFloat(latLngMatch[1]);
    result.lng = parseFloat(latLngMatch[2]);
  }

  // Heading: after h in the URL (e.g., 14.82h)
  const headingMatch = url.match(/,(\d+(?:\.\d+)?)h/);
  if (headingMatch) {
    result.heading = parseFloat(headingMatch[1]);
  }

  // Pitch: after t in the URL (e.g., 88.07t)
  const pitchMatch = url.match(/,(\d+(?:\.\d+)?)t/);
  if (pitchMatch) {
    result.pitch = parseFloat(pitchMatch[1]);
  }

  // FOV: after y in the URL (e.g., 75y)
  const fovMatch = url.match(/,(\d+(?:\.\d+)?)y/);
  if (fovMatch) {
    result.fov = parseFloat(fovMatch[1]);
  }

  // Pano ID: after !1s in the URL
  const panoMatch = url.match(/!1s([^!]+)/);
  if (panoMatch) {
    result.pano = panoMatch[1];
  }

  return result;
}

export default function StreetView({
  location,
}: {
  location: YourPeerLegacyLocationData;
}) {
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const [mapCenter, setMapCenter] = useState<Position>(location);
  const [locationStubs, setLocationStubs] = useState<SimplifiedLocationData[]>(
    [],
  );
  const data = extractStreetViewData(location.streetview_url);

  let streetview = `${location.lat},${location.lng}`;
  if (data !== null) {
    streetview = `${data.lat},${data.lng}&fov=${data.fov ?? 75}&heading=${data.heading ?? 0}&pano=${data.pano ?? ""}`;
  }
  const streetviewHref = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetview}`;

  // TODO: eliminate duplicate code
  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => {
      const googleMapDiv = ev.map.getDiv();

      // if google map is already hidden, then ignore the event, because we get a weird zoom
      if (
        !googleMapDiv ||
        (googleMapDiv.clientHeight === 0 && googleMapDiv.clientWidth === 0)
      )
        return;

      const newCenter = ev.detail.center;
      if (
        newCenter.lat !== 0 &&
        newCenter.lng !== 0 &&
        (mapCenter.lat !== newCenter.lat || mapCenter.lng !== newCenter.lng)
      ) {
        setMapCenter(newCenter);
      }

      const newZoom = ev.detail.zoom;
      if (newZoom && newZoom !== zoom) {
        setZoom(newZoom);
      }
    },
    [mapCenter, setMapCenter, zoom, setZoom],
  );

  // TODO: call the locationStubs API
  useEffect(() => {}, []);

  return location.closed ? undefined : (
    <div>
      <div>
        <a
          href={streetviewHref}
          target="_blank"
          className="w-full max-h-72 h-72 bg-neutral-100 overflow-hidden relative hidden md:block"
        >
          <img
            src={`https://maps.googleapis.com/maps/api/streetview?size=600x500&key=${GOOGLE_MAPS_API_KEY}&fov=100&location=${streetview}`}
            className="w-full h-full object-cover object-center cursor-pointer"
            loading="lazy"
          />
          <span className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow-sm rounded-full px-5 py-2 text-dark font-medium text-sm">
            Open Street View
          </span>
        </a>
      </div>
      <div className="w-full max-h-52 h-52 overflow-hidden relative md:hidden">
        <div id="miniMap" className="w-full h-full bg-neutral-100">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["marker"]}>
            <Map
              defaultZoom={zoom}
              gestureHandling={"greedy"}
              zoomControl={false}
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={false}
              center={mapCenter}
              styles={mapStyles}
              onCameraChanged={handleCameraChange}
            >
              <Marker
                position={location}
                title={location.name}
                icon={activeMarkerIcon}
              />
              <span>
                {locationStubs
                  ? locationStubs
                      .filter((locationStub) => locationStub.id !== location.id)
                      .map((locationStub) => (
                        <LocationStubMarker
                          locationStub={locationStub}
                          key={locationStub.id}
                        />
                      ))
                  : undefined}
              </span>
            </Map>
          </APIProvider>
        </div>
        <a
          href={streetviewHref}
          target="_blank"
          className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow rounded-full px-5 py-2 text-dark font-medium text-sm"
        >
          Open Street View
        </a>
      </div>
    </div>
  );
}
