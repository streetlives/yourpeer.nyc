import { LocationDetailLoadingSkeleton } from "yourpeer.nyc-nextjs";

export const InPanel = () => (
  <div className="relative h-[560px] w-96 overflow-hidden border border-neutral-200">
    <LocationDetailLoadingSkeleton className="!absolute" />
  </div>
);
