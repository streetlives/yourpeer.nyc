"use client";

import { EllipsisVerticalIcon, UserIcon } from "@heroicons/react/24/outline";
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
import { hideComment } from "@/components/streetlives-api-service";
import { toast } from "sonner";
import Spinner from "@/components/spinner";

export default function ReviewListItem({
  comment,
  isStuffUser,
  isAdmin,
}: {
  comment: Comment;
  isStuffUser: boolean | null;
  isAdmin: boolean;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);
  const queryClient = useQueryClient();

  const { mutate: mutateHideComment, isPending } = useMutation({
    mutationFn: (hidden: boolean) => hideComment(comment.id, hidden),
    onSuccess: () => {
      toast("Done");
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <li className="relative">
      {isPending && (
        <div className="absolute bg-white/85 size-full inset-0 z-10 flex items-center justify-center">
          <Spinner />
        </div>
      )}

      <div className="bg-white py-5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 flex items-center justify-center text-white bg-purple/70 rounded-full">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-grey-900 text-sm mb-1 font-medium flex items-center gap-2">
                <span>Anonymous Client</span>
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
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVerticalIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Report</DropdownMenuItem>
              {isStuffUser && (
                <DropdownMenuItem onClick={() => setIsReplying(true)}>
                  Reply
                </DropdownMenuItem>
              )}
              {isAdmin && comment.hidden === true ? (
                <DropdownMenuItem onClick={() => mutateHideComment(false)}>
                  Unhide
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => mutateHideComment(true)}>
                  Hide
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 text-grey-700 text-sm">
          <p>{typeof comment.content === "string" && comment.content}</p>
          {typeof comment.content !== "string" &&
          comment.content.whatServicesDidYouUse?.length ? (
            <p className="mt-2">
              <span>Services Used: </span>
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
            </p>
          ) : undefined}
        </div>
        <div className="mt-4">
          <h4 className="text-grey-900 text-sm font-bold mb-1">
            What went well
          </h4>
          <p className="text-grey-900 text-sm">
            {typeof comment.content !== "string" && comment.content.whatWentWell
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

        {comment.Replies.map((reply) => (
          <ReplyItem key={reply.id} reply={reply} />
        ))}

        {isReplying ? undefined : (
          <div className="flex items-center gap-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:bg-transparent px-0"
            >
              <HandThumbUpIcon />
              <span>Helpful</span>
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
        />
      )}
    </li>
  );
}
