"use client";

import ReviewListItem from "@/components/feedback/review-list-item";
import { fetchComments } from "@/components/streetlives-api-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useAdminUser, useStuffUser } from "@/components/use-user-role";

export default function ReviewList({
  locationId,
  organizationId,
  location_services,
  orgName,
}: {
  locationId: string;
  organizationId: string;
  location_services: string[];
  orgName: string;
}) {
  const { isStuffUser } = useStuffUser(organizationId);
  const { isAdmin } = useAdminUser();

  const { data, status, error } = useQuery({
    queryKey: ["comments"],
    queryFn: () => fetchComments(locationId),
    select: (data) =>
      data?.filter((comment) => (isAdmin ? true : comment.hidden !== true)),
  });

  return status === "pending" ? (
    <div className="p-4 flex flex-1 flex-col space-y-10 bg-white">
      <CommentSkeleton />
      <CommentSkeleton />
      <CommentSkeleton />
    </div>
  ) : status === "error" ? (
    <p className="p-4 bg-white rounded-md m-4 text-sm text-danger">
      Error: {error.message}
    </p>
  ) : (
    <>
      {data?.length ? (
        <ul className="flex flex-col space-y-2 h-full overflow-y-auto pb-12">
          {data.map((comment) => (
            <ReviewListItem
              key={comment.id}
              comment={comment}
              isStuffUser={isStuffUser}
              isAdmin={isAdmin || false}
              locationServices={location_services}
              orgName={orgName}
            />
          ))}
        </ul>
      ) : (
        <p className="p-4 bg-white rounded-md m-4 text-sm">
          Nothing to show yet
        </p>
      )}
    </>
  );
}

function CommentSkeleton() {
  return (
    <div>
      <div className="flex items-center space-x-4 mb-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-[100px] w-full rounded-xl" />
    </div>
  );
}
