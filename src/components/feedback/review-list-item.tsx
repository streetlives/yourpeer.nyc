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
  HandThumbUpIcon,
} from "@heroicons/react/20/solid";
import ReplyForm from "@/components/feedback/reply-form";

export default function ReviewListItem({ comment }: { comment: Comment }) {
  const [isReplying, setIsReplying] = useState(false);
  const { user } = useAuthenticator((context) => [context.user]);

  console.log(user);
  console.log(comment);

  return (
    <li>
      <div className="bg-white py-5 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 flex items-center justify-center text-white bg-purple/70 rounded-full">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-grey-900 text-sm mb-1 font-medium">
                Anonymous Client
              </div>
              <div className="text-xs text-grey-700">
                {moment(comment.created_at).format("MMMM Do YYYY")}
              </div>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <EllipsisVerticalIcon className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsReplying(true)}>
                  Reply
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="mt-4 text-grey-700 text-sm">
          <p>{comment.content}</p>
        </div>
        <div className="mt-4">
          <h4 className="text-grey-900 text-sm font-bold mb-1">
            What went well
          </h4>
          <p className="text-grey-900 text-sm">skipped</p>
        </div>
        <div className="mt-4">
          <h4 className="text-grey-900 text-sm font-bold mb-1">
            What could be improved
          </h4>
          <p className="text-grey-900 text-sm">skipped</p>
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

            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(true)}
                className="hover:bg-transparent px-0"
              >
                <ChatBubbleLeftEllipsisIcon />
                <span>Reply</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {isReplying && <ReplyForm onCancel={() => setIsReplying(false)} />}
    </li>
  );
}
