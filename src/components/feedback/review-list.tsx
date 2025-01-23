import ReviewListItem from "@/components/feedback/review-list-item";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { Comment } from "@/components/common";
import { fetchComments } from "@/components/streetlives-api-service";

export default function ReviewList({ locationId }: { locationId: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const commentsData = await fetchComments(locationId);
        const sortedByDate = commentsData.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        setComments(sortedByDate);
      } catch (e) {
        console.error(e);
        setComments([]);
      }
    };

    loadComments();
  }, [locationId]);

  if (!comments)
    return (
      <p className="p-4 flex items-center justify-center mt-5">Loading...</p>
    );

  return (
    <div className="bg-neutral-100 h-full relative overflow-y-hidden pt-2">
      {comments.length ? (
        <ul className="flex flex-col space-y-2 h-full overflow-y-auto pb-12">
          {comments.map((comment) => (
            <ReviewListItem key={comment.id} comment={comment} />
          ))}
        </ul>
      ) : (
        <p className="p-4 bg-white rounded-md m-4 text-sm">
          Nothing to show yet
        </p>
      )}

      <div className=" absolute bottom-0 w-full bg-white px-5 py-2">
        <button className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full">
          <PlusCircleIcon className="w-5 h-5 text-white" />
          <span>Add review</span>
        </button>
      </div>
    </div>
  );
}
