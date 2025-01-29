"use client";

import ReviewListItem from "@/components/feedback/review-list-item";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { Comment } from "@/components/common";
import { fetchComments } from "@/components/streetlives-api-service";
import { Authenticator } from "@aws-amplify/ui-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersOrganizations } from "@/components/auth";

export default function ReviewList({
  locationId,
  onAddReview,
  organizationId,
}: {
  locationId: string;
  onAddReview: () => void;
  organizationId: string;
}) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [isStuffUser, setIsStuffUser] = useState<boolean | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setComments(await fetchComments(locationId));
      } catch (e) {
        setComments([]);
      }
    };

    loadComments();
  }, [locationId]);

  useEffect(() => {
    const getUserOrganizations = async () => {
      const userOrganizations = await getUsersOrganizations();
      const isStuffUser =
        (userOrganizations &&
          userOrganizations.indexOf(organizationId) !== -1) ||
        false;
      setIsStuffUser(isStuffUser);
    };
    getUserOrganizations();
  }, [organizationId]);

  if (!comments)
    return (
      <div className="p-4 flex flex-col space-y-10">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );

  return (
    <div className="bg-neutral-100 h-full relative overflow-y-hidden pt-2">
      {comments.length ? (
        <Authenticator.Provider>
          <ul className="flex flex-col space-y-2 h-full overflow-y-auto pb-12">
            {comments.map((comment) => (
              <ReviewListItem
                key={comment.id}
                comment={comment}
                isStuffUser={isStuffUser}
              />
            ))}
          </ul>
        </Authenticator.Provider>
      ) : (
        <p className="p-4 bg-white rounded-md m-4 text-sm">
          Nothing to show yet
        </p>
      )}

      <div className=" absolute bottom-0 w-full bg-white px-5 py-2">
        <button
          onClick={onAddReview}
          className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full"
        >
          <PlusCircleIcon className="w-5 h-5 text-white" />
          <span>Add review</span>
        </button>
      </div>
    </div>
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
