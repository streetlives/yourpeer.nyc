import { Button, Spinner } from "yourpeer.nyc-nextjs";

export const InButton = () => (
  <Button disabled className="gap-2">
    <Spinner /> Saving...
  </Button>
);

export const OnLight = () => (
  <div className="flex items-center gap-2 text-sm text-dark">
    <Spinner /> Loading locations
  </div>
);
