"use client";

import {
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Comment } from "@/components/common";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthenticator } from "@aws-amplify/ui-react";
import ReplyItem from "@/components/feedback/reply-item";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChatBubbleLeftEllipsisIcon,
  EyeSlashIcon,
  HandThumbUpIcon,
} from "@heroicons/react/20/solid";
import ReplyForm from "@/components/feedback/reply-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  hideComment,
  likeComment,
  undoLikeComment,
} from "@/components/streetlives-api-service";
import { toast } from "sonner";
import Spinner from "@/components/spinner";
import ReportComment from "@/components/feedback/report-comment";
import { clsx } from "clsx";

export default function ReviewListItem({
  comment,
  isStuffUser,
  isAdmin,
  locationServices,
  orgName,
}: {
  comment: Comment;
  isStuffUser: boolean | null;
  isAdmin: boolean;
  locationServices: string[];
  orgName: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);
  const queryClient = useQueryClient();

  const { mutate: mutateHideComment, isPending } = useMutation({
    mutationFn: (hidden: boolean) => hideComment(comment.id, hidden),
    onSuccess: () =>
      queryClient.setQueryData(["comments"], (old: Comment[]) =>
        old.map((c) => (c.id === comment.id ? { ...c, hidden: !c.hidden } : c)),
      ),
    onError: (error) => toast.error(error.message),
  });

  const { mutate: mutateLike } = useMutation({
    mutationFn: comment.likedByCurrentUser ? undoLikeComment : likeComment,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previousComments = queryClient.getQueryData(["comments"]);

      queryClient.setQueryData(["comments"], (old: Comment[]) =>
        old.map((c) =>
          c.id === comment.id
            ? {
                ...c,
                likes_count: comment.likedByCurrentUser
                  ? c.likes_count - 1
                  : c.likes_count + 1,
                likedByCurrentUser: !comment.likedByCurrentUser,
              }
            : c,
        ),
      );

      return { previousComments };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["comments"] }),
    onError: (err, _, context) => {
      queryClient.setQueryData(["comments"], context?.previousComments);
      toast.error(err.message);
    },
  });

  return (
    <li>
      <ReportComment
        commentId={comment.id}
        open={isReporting}
        comment={comment}
        onComplete={() => setIsReporting(false)}
      />

      <div className="bg-white py-5 px-4 relative">
        {isPending && (
          <div className="absolute bg-white/85 size-full inset-0 z-10 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 flex items-center justify-center text-white bg-purple/70 rounded-full">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="ml-2">
              <div className="text-grey-900 text-sm mb-1 font-medium flex items-center gap-2">
                <span>
                  {comment.contact_info && (isStuffUser || isAdmin)
                    ? comment.contact_info
                    : "Anonymous Client"}
                </span>
                {comment.hidden === true && isAdmin && (
                  <button
                    onClick={() => mutateHideComment(false)}
                    className="text-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
                  >
                    <EyeSlashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-grey-700">
                {moment(comment.created_at).format("MMMM Do YYYY")}
              </div>
            </div>
            {comment.report_count > 0 && (isAdmin || isStuffUser) && (
              <span className="text-xs ml-3 self-start gap-1 border border-red-500 bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full inline-flex items-center">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>{comment.report_count}</span>
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVerticalIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsReporting(true)}>
                Report
              </DropdownMenuItem>

              {isStuffUser && (
                <DropdownMenuItem onClick={() => setIsReplying(true)}>
                  Reply
                </DropdownMenuItem>
              )}
              {isAdmin &&
                (comment.hidden === true ? (
                  <DropdownMenuItem onClick={() => mutateHideComment(false)}>
                    Unhide
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => mutateHideComment(true)}>
                    Hide
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 text-grey-700 text-sm">
          <p>{typeof comment.content === "string" && comment.content}</p>
          {typeof comment.content !== "string" &&
          comment.content.whatServicesDidYouUse?.length ? (
            <p className="mt-2">
              <span>Services Used: </span>
              {locationServices.length ===
              comment.content.whatServicesDidYouUse.length ? (
                "All Services"
              ) : (
                <span>
                  {comment.content.whatServicesDidYouUse.map((s, i) => (
                    <span key={s}>
                      {s}
                      {typeof comment.content !== "string" &&
                      comment.content.whatServicesDidYouUse?.length &&
                      i !== comment.content.whatServicesDidYouUse.length - 1
                        ? ", "
                        : ""}
                    </span>
                  ))}
                </span>
              )}
            </p>
          ) : undefined}
        </div>
        {typeof comment.content !== "string" && (
          <>
            <div className="mt-4">
              <h4 className="text-grey-900 text-sm font-bold mb-1">
                What went well
              </h4>
              <p className="text-grey-900 text-sm">
                {typeof comment.content !== "string" &&
                comment.content.whatWentWell
                  ? comment.content.whatWentWell
                  : "skipped"}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-grey-900 text-sm font-bold mb-1">
                What could be improved
              </h4>
              <p className="text-grey-900 text-sm">
                {typeof comment.content !== "string" &&
                comment.content.whatCouldBeImproved
                  ? comment.content.whatCouldBeImproved
                  : "skipped"}
              </p>
            </div>
          </>
        )}
        <div>
          {isReplying
            ? undefined
            : comment.Replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} orgName={orgName} />
              ))}
        </div>

        {isReplying ? undefined : (
          <div className="flex items-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className={clsx(
                "hover:bg-transparent px-0",
                comment.likedByCurrentUser && "text-blue hover:text-blue",
              )}
              onClick={() => mutateLike(comment.id)}
            >
              <HandThumbUpIcon />
              <span>Helpful</span>
              {comment.likes_count > 0 && <span>({comment.likes_count})</span>}
            </Button>

            {isStuffUser === null ? (
              <Skeleton className="w-10 h-4" />
            ) : (
              isStuffUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(true)}
                  className="hover:bg-transparent px-0"
                >
                  <ChatBubbleLeftEllipsisIcon />
                  <span>{comment.Replies.length ? "Edit Reply" : "Reply"}</span>
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {isReplying && (
        <ReplyForm
          commentId={comment.id}
          username={user.username}
          reply={comment.Replies?.[0] ?? undefined}
          onComplete={() => setIsReplying(false)}
          orgName={orgName}
        />
      )}
    </li>
  );
}
