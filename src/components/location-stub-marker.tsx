import { Marker } from "@vis.gl/react-google-maps";
import { SimplifiedLocationData } from "./common";
import { activeMarkerIcon } from "./map-common";

export default function LocationStubMarker({
  locationStub,
  activeLocationSlug,
  handleClickOnLocationStubMarker,
}: {
  locationStub: SimplifiedLocationData;
  activeLocationSlug?: string;
  handleClickOnLocationStubMarker?: (
    locationStub: SimplifiedLocationData,
  ) => void;
}) {
  return (
    <Marker
      position={{
        lat: locationStub.position.coordinates[1],
        lng: locationStub.position.coordinates[0],
      }}
      clickable={true}
      onClick={() =>
        handleClickOnLocationStubMarker &&
        handleClickOnLocationStubMarker(locationStub)
      }
      title={locationStub.name}
      icon={
        locationStub.closed
          ? {
              url: "/img/icons/closed-pin.png",
              scaledSize: new window.google.maps.Size(25, 32),
            }
          : activeLocationSlug === locationStub.slug
            ? activeMarkerIcon
            : {
                url: "/img/icons/pin.png",
                scaledSize: new window.google.maps.Size(25, 32),
              }
      }
    />
  );
}
