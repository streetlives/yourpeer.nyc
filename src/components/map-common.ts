// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

export const defaultZoom = 14;

// Advanced Markers (google.maps.marker.AdvancedMarkerElement) only render on a map that was
// initialized with a cloud-based Map ID. DEMO_MAP_ID is Google's development-only fallback: it
// renders markers but ignores any cloud style, so every deployed environment should set
// NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID to a real Map ID.
export const GOOGLE_MAPS_MAP_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

// Pixel sizes of the pin assets, kept here so the <img> inside an AdvancedMarker renders at the
// same size the legacy Marker's scaledSize used to.
export const pinSize = { width: 25, height: 32 };
export const activePinSize = { width: 34, height: 45 };
export const myLocationIconSize = { width: 50, height: 50 };

export const markerIcon =
  "data:image/svg+xml,%3Csvg width='25' height='32' viewBox='0 0 25 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='cash-pin' filter='url(%23filter0_d_28_9457)'%3E%3Cpath id='Shape' fill-rule='evenodd' clip-rule='evenodd' d='M12.5 1C16.6421 1 20 4.35786 20 8.5C20 11.907 14.926 19.857 13.125 22.572C12.9857 22.781 12.7512 22.9066 12.5 22.9066C12.2488 22.9066 12.0143 22.781 11.875 22.572C10.074 19.856 5 11.907 5 8.5C5 4.35786 8.35786 1 12.5 1Z' fill='%23FFDC00' stroke='%23323232' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_28_9457' x='0.25' y='0.25' width='24.5' height='31.4066' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_28_9457'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_28_9457' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A";
export const myLocationIcon =
  "data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='25' fill='%230085FF' fill-opacity='0.2'/%3E%3Ccircle cx='25' cy='25' r='7.5' fill='white'/%3E%3Ccircle cx='25' cy='25' r='5' fill='%230085FF'/%3E%3C/svg%3E ";
export const activeMarkerIcon =
  "data:image/svg+xml,%3Csvg width='34' height='45' viewBox='0 0 34 45' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='pin1' filter='url(%23filter0_d_28_9454)'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M17 1C23.6274 1 29 6.37258 29 13C29 18.4512 20.8816 31.1712 18 35.5152C17.7772 35.8497 17.4019 36.0506 17 36.0506C16.5981 36.0506 16.2228 35.8497 16 35.5152C13.1184 31.1696 5 18.4512 5 13C5 6.37258 10.3726 1 17 1Z' fill='%23323232'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M17 1C23.6274 1 29 6.37258 29 13C29 18.4512 20.8816 31.1712 18 35.5152C17.7772 35.8497 17.4019 36.0506 17 36.0506C16.5981 36.0506 16.2228 35.8497 16 35.5152C13.1184 31.1696 5 18.4512 5 13C5 6.37258 10.3726 1 17 1Z' stroke='%23323232' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_28_9454' x='0.25' y='0.25' width='33.5' height='44.5506' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3CfeComposite in2='hardAlpha' operator='out'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_28_9454'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_28_9454' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A";
export const closedMarker =
  "data:image/svg+xml,%3Csvg width='25' height='32' viewBox='0 0 25 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='cash-pin' filter='url(%23filter0_d_28_9460)'%3E%3Cpath id='Shape' fill-rule='evenodd' clip-rule='evenodd' d='M12.5 1C16.6421 1 20 4.35786 20 8.5C20 11.907 14.926 19.857 13.125 22.572C12.9857 22.781 12.7512 22.9066 12.5 22.9066C12.2488 22.9066 12.0143 22.781 11.875 22.572C10.074 19.856 5 11.907 5 8.5C5 4.35786 8.35786 1 12.5 1Z' fill='%23F0F0F0' stroke='%23323232' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_d_28_9460' x='0.25' y='0.25' width='24.5' height='31.4066' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha'/%3E%3CfeOffset dy='4'/%3E%3CfeGaussianBlur stdDeviation='2'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/%3E%3CfeBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_28_9460'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_28_9460' result='shape'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A";
