"use client";

import { YourPeerLegacyLocationData } from "@/components/common";
import { buildStreetViewUrls } from "@/lib/streetView";

export default function StreetView({
  location,
}: {
  location: YourPeerLegacyLocationData;
}) {
  const { imageUrl, mapsUrl } = buildStreetViewUrls(location, {
    size: "600x500",
  });

  return location.closed ? undefined : (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full h-52 md:h-72 bg-neutral-100 overflow-hidden relative block"
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover object-center cursor-pointer"
        width="600"
        height="500"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <span className="inline-block absolute bottom-4 right-4 z-0 bg-white shadow-sm rounded-full px-5 py-2 text-dark font-medium text-sm">
        Open Street View
      </span>
    </a>
  );
}
