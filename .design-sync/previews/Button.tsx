import { Button, Spinner } from "yourpeer.nyc-nextjs";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Save changes</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="secondary">Add hours</Button>
    <Button variant="ghost">Skip</Button>
    <Button variant="link">View on map</Button>
    <Button variant="destructive">Delete service</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const States = () => (
  <div className="flex items-center gap-3">
    <Button disabled>Disabled</Button>
    <Button disabled className="gap-2">
      <Spinner /> Saving...
    </Button>
  </div>
);

export const FullWidthActionBar = () => (
  <div className="w-80 border border-neutral-200 rounded-lg bg-white">
    <div className="p-5 text-sm text-dark">Is this location still open?</div>
    <div className="flex flex-col gap-2 px-5 pb-5">
      <Button className="w-full">Yes, it's open</Button>
      <Button variant="outline" className="w-full">No, it's closed</Button>
    </div>
  </div>
);
