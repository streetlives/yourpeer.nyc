// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

/**
 * The visual content of an AdvancedMarker. AdvancedMarkerElement anchors its content element at
 * bottom-center, which is also where the legacy Marker anchored an icon by default, so the pins
 * land on the same coordinate as before.
 *
 * The explicit width/height and `maxWidth: none` are load-bearing: Tailwind's preflight applies
 * `img { max-width: 100%; height: auto }`, and the marker content element has no intrinsic width,
 * so without them the pin can collapse.
 */
export default function MapPinImage({
  src,
  width,
  height,
  centered = false,
}: {
  src: string;
  width: number;
  height: number;
  /** Anchor the image at its center instead of bottom-center (used for the "you are here" dot). */
  centered?: boolean;
}) {
  return (
    <img
      src={src}
      // the AdvancedMarker's `title` already supplies the accessible name
      alt=""
      width={width}
      height={height}
      draggable={false}
      style={{
        width,
        height,
        maxWidth: "none",
        display: "block",
        transform: centered ? `translateY(${height / 2}px)` : undefined,
      }}
    />
  );
}
