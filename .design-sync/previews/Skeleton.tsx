import { Skeleton } from "yourpeer.nyc-nextjs";

export const ContentPlaceholder = () => (
  <div className="w-80 space-y-3">
    <Skeleton className="h-7 w-3/4 rounded-full" />
    <Skeleton className="h-4 w-1/2 rounded-full" />
    <Skeleton className="h-4 w-1/3 rounded-full" />
    <Skeleton className="h-32 w-full rounded-xl" />
  </div>
);

export const ListRow = () => (
  <div className="w-80 flex items-center gap-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4 rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
    </div>
  </div>
);
