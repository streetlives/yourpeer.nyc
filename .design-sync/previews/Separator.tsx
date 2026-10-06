import { Separator } from "yourpeer.nyc-nextjs";

export const HorizontalAndVertical = () => (
  <div className="w-72 text-sm">
    <p className="font-medium text-dark">Holy Apostles Soup Kitchen</p>
    <p className="text-xs text-neutral-500">296 9th Ave, New York, NY 10001</p>
    <Separator className="my-3" />
    <div className="flex h-5 items-center gap-3 text-neutral-500">
      <span>Food</span>
      <Separator orientation="vertical" />
      <span>Chelsea</span>
      <Separator orientation="vertical" />
      <span className="text-success">Open now</span>
    </div>
  </div>
);
