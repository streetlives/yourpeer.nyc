import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { SimplifiedLocationData } from "./common";
import { activeMarkerIcon, activePinSize, pinSize } from "./map-common";
import MapPinImage from "./map-pin-image";

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
  const isActive = activeLocationSlug === locationStub.slug;
  const { src, size } = isActive
    ? { src: activeMarkerIcon, size: activePinSize }
    : locationStub.closed
      ? { src: "/img/icons/closed-pin.png", size: pinSize }
      : { src: "/img/icons/pin.avif", size: pinSize };

  return (
    <AdvancedMarker
      position={{
        lat: locationStub.position.coordinates[1],
        lng: locationStub.position.coordinates[0],
      }}
      clickable={true}
      onClick={() =>
        handleClickOnLocationStubMarker &&
        !isActive &&
        handleClickOnLocationStubMarker(locationStub)
      }
      title={locationStub.name}
      // keep the selected pin on top of its neighbours, which the taller active icon would
      // otherwise be drawn behind
      zIndex={isActive ? 1 : undefined}
    >
      <MapPinImage src={src} width={size.width} height={size.height} />
    </AdvancedMarker>
  );
}
