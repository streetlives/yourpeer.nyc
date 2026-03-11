import { Skeleton } from "@/components/ui/skeleton";

export function LocationDetailLoadingSkeletonContent() {
  return (
    <>
      <div className="h-14 border-b border-neutral-100 px-4 flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-full" />
      </div>

      <div className="p-4 space-y-4">
        <Skeleton className="h-7 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full" />
      </div>

      <div className="px-4 pb-6 space-y-3">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-11/12 rounded-full" />
        <Skeleton className="h-4 w-10/12 rounded-full" />
        <Skeleton className="h-10 w-full rounded-full mt-4" />
      </div>
    </>
  );
}

export default function LocationDetailLoadingSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`details-screen bg-white md:flex z-50 fixed md:absolute inset-0 w-full h-full overflow-y-auto flex flex-col ${className || ""}`.trim()}
    >
      <LocationDetailLoadingSkeletonContent />
    </div>
  );
}
