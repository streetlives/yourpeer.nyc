import { ExploreServicesButton } from "yourpeer.nyc-nextjs";

export const Primary = () => <ExploreServicesButton />;

export const Outline = () => (
  <div className="flex w-56">
    <ExploreServicesButton className="outline-button" />
  </div>
);
