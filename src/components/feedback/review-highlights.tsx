"use client";

import { getFeedbackHighlights } from "@/components/streetlives-api-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getFormatedHighlights } from "@/lib/utils";

export default function ReviewHighlights({
  locationId,
}: {
  locationId: string;
}) {
  const { data, status } = useQuery({
    queryKey: ["highlights"],
    retry: false,
    queryFn: () => getFeedbackHighlights(locationId),
    select: (data) => getFormatedHighlights(data),
  });

  return status === "pending" ? (
    <LoadingSkeleton />
  ) : status === "error" ? (
    <p className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
      No Comments found
    </p>
  ) : (
    <ul className="flex flex-col space-y-3">
      {data.map((highlight, idx) => (
        <li
          key={idx}
          className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900"
          dangerouslySetInnerHTML={{
            __html: highlight,
          }}
        ></li>
      ))}
    </ul>
  );
}

function LoadingSkeleton() {
  return (
    <ul className="flex flex-col space-y-3">
      <Skeleton className="w-full h-6 rounded-full" />
      <Skeleton className="w-full h-6 rounded-full" />
      <Skeleton className="w-full h-6 rounded-full" />
    </ul>
  );
}
