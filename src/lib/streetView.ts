import { StreetviewData } from "@/components/common";

interface StreetViewOptions {
  size?: string;
}

export function buildStreetViewUrls(
  location: { lat: number; lng: number; streetview?: StreetviewData | null },
  { size = "600x400" }: StreetViewOptions = {},
): { imageUrl: string; mapsUrl: string } {
  const sv = location.streetview;

  const panoId = sv?.pano_id ?? null;
  const lat = sv?.lat ?? location.lat;
  const lng = sv?.lng ?? location.lng;
  const heading = sv?.heading ?? null;
  const pitch = sv?.pitch ?? 0;
  const fov = sv?.fov ?? 90;

  const imgParams = new URLSearchParams({
    size,
    pitch: String(pitch),
    fov: String(fov),
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  if (panoId) imgParams.set("pano", panoId);
  else imgParams.set("location", `${lat},${lng}`);
  if (heading !== null) imgParams.set("heading", String(heading));

  const imageUrl = `https://maps.googleapis.com/maps/api/streetview?${imgParams}`;

  const mapsParams = new URLSearchParams({
    api: "1",
    map_action: "pano",
  });
  if (panoId) mapsParams.set("pano", panoId);
  else mapsParams.set("viewpoint", `${lat},${lng}`);
  if (heading !== null) mapsParams.set("heading", String(heading));
  mapsParams.set("pitch", String(pitch));

  const mapsUrl = `https://www.google.com/maps/@?${mapsParams}`;

  return { imageUrl, mapsUrl };
}
