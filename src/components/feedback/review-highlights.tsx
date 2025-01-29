"use client";

import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { getFeedbackHighlights } from "@/components/streetlives-api-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export default function ReviewHighlights({
  locationId,
  onViewAll,
  onAddReview,
}: {
  onViewAll: () => void;
  onAddReview: () => void;
  locationId: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["highlights"],
    queryFn: () => getFeedbackHighlights(locationId),
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="bg-neutral-50 pt-2" id="reviews">
      <div className="bg-white p-4 pt-8">
        <div className="bg-purple/10 rounded-lg px-4 py-3 flex space-x-2">
          <img
            src="/img/icons/group-users-icon.svg"
            className="flex-shrink-0 w-6 h-6 object-contain"
            alt=""
          />
          <div className="pr-6">
            <p className="text-sm mb-2">
              YourPeer works with SCO Family of Services to collect community
              feedback.
            </p>
            <a href="#" className="text-purple text-sm">
              Learn more
            </a>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-grey-900">
              Review highlights
            </h3>
            <button className="text-blue text-sm" onClick={onViewAll}>
              View all
            </button>
          </div>
          <ul className="mt-3 flex flex-col space-y-3">
            {data?.length ? (
              data.map((highlight, idx) => (
                <li
                  key={idx}
                  className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900"
                >
                  {highlight}
                </li>
              ))
            ) : (
              <li className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
                No Comments found
              </li>
            )}
          </ul>

          <div className="mt-4">
            <button
              onClick={onAddReview}
              className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full"
            >
              <PlusCircleIcon className="w-5 h-5 text-white" />
              <span>Add review</span>
            </button>
            <button
              onClick={onViewAll}
              className="mt-3 flex items-center justify-center py-2 px-4 space-x-2 text-grey-900 font-medium bg-white border border-neutral-300 rounded-full w-full"
            >
              View all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="pt-2">
      <div className="bg-white p-4 pt-8">
        <Skeleton className="w-full h-10 rounded-lg" />

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="w-2/4 h-4 rounded-md" />

            <Skeleton className="w-9 h-4 rounded-md" />
          </div>

          <ul className="mt-3 flex flex-col space-y-3">
            <Skeleton className="w-full h-6 rounded-full" />
            <Skeleton className="w-full h-6 rounded-full" />
            <Skeleton className="w-full h-6 rounded-full" />
            <Skeleton className="w-full h-6 rounded-full" />
          </ul>

          <div className="mt-8 space-y-3">
            <Skeleton className="w-full rounded-full h-6 " />

            <Skeleton className="w-full rounded-full h-6 " />
          </div>
        </div>
      </div>
    </div>
  );
}
