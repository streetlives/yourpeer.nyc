import { Badge } from "yourpeer.nyc-nextjs";

export const Variants = () => (
  <div className="flex gap-2">
    <Badge>Verified</Badge>
    <Badge variant="secondary">6 months ago</Badge>
    <Badge variant="destructive">Closed</Badge>
    <Badge variant="outline">Draft</Badge>
  </div>
);

export const InContext = () => (
  <div className="w-72 text-sm">
    <div className="flex items-center justify-between">
      <span className="font-medium text-dark">Opening hours</span>
      <Badge variant="secondary">Updated today</Badge>
    </div>
    <p className="text-neutral-500 mt-1">Mon–Fri 9AM to 5PM</p>
  </div>
);
