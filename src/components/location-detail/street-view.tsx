"use client";

import {
  Position,
  SimplifiedLocationData,
  YourPeerLegacyLocationData,
} from "@/components/common";
import LocationStubMarker from "@/components/location-stub-marker";
import {
  activeMarkerIcon,
  defaultZoom,
  mapStyles,
} from "@/components/map-common";
import { buildStreetViewUrls } from "@/lib/streetView";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
).toString();

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

  const { imageUrl, mapsUrl } = buildStreetViewUrls(location, {
    size: "600x500",
  });

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
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-h-72 h-72 bg-neutral-100 overflow-hidden relative hidden md:block"
        >
          <img
            src={imageUrl}
            alt=""
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
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow rounded-full px-5 py-2 text-dark font-medium text-sm"
        >
          Open Street View
        </a>
      </div>
    </div>
  );
}
