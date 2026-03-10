import { Marker } from "@vis.gl/react-google-maps";
import { SimplifiedLocationData } from "./common";
import { useRouter } from "next/navigation";
import { activeMarkerIcon, closedMarker } from "./map-common";

export default function LocationStubMarker({
  locationStub,
  locationSlugClickedOnMobile,
  handleClickOnLocationStubMarker,
}: {
  locationStub: SimplifiedLocationData;
  locationSlugClickedOnMobile?: string;
  handleClickOnLocationStubMarker?: (
    locationStub: SimplifiedLocationData,
  ) => void;
}) {
  const router = useRouter();
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
          ? closedMarker
          : locationSlugClickedOnMobile === locationStub.slug
            ? activeMarkerIcon
            : {
                url: "/img/icons/pin.png",
                scaledSize: new window.google.maps.Size(25, 32),
              }
      }
    />
  );
}
