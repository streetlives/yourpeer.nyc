import { Button, Popover, PopoverContent, PopoverTrigger } from "yourpeer.nyc-nextjs";

export const FilterPanel = () => (
  <div className="p-2">
    <Popover open modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline">Opening hours</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="space-y-3">
        <p className="text-xs font-semibold text-dark">Opening hours</p>
        <div className="flex w-full">
          <label className="text-xs flex-1 border py-2 px-3 text-center rounded-l-lg bg-primary border-black">Open now</label>
          <label className="text-xs flex-1 border py-2 px-3 text-center rounded-r-lg">Any time</label>
        </div>
        <p className="text-xs text-neutral-500">Shows services open at the current time.</p>
      </PopoverContent>
    </Popover>
  </div>
);
