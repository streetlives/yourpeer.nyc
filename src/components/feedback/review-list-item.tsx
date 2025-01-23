import { EllipsisVerticalIcon, UserIcon } from "@heroicons/react/24/outline";
import { Comment, Reply } from "@/components/common";
import moment from "moment";

const ReplyItem = ({ reply }: { reply: Reply }) => {
  return (
    <div className="mt-3 rounded-3xl p-4 bg-grey-100  ">
      <div className="flex items-center space-x-2">
        <img
          src="/img/avatar.png"
          className="h-9 w-9 object-contain flex-shrink-0"
          alt=""
        />
        <div>
          <div className=" text-sm text-black font-medium mb-1">AFC staff</div>
          <div className="text-gray-600 text-xs">
            {moment(reply.created_at).format("MMMM Do YYYY")}
          </div>
        </div>
      </div>
      <p className="mt-4 text-dark text-sm">{reply.content}</p>
    </div>
  );
};

export default function ReviewListItem({ comment }: { comment: Comment }) {
  return (
    <li className="bg-white py-5 px-4">
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
          <button className="font-bold text-grey-900">
            <EllipsisVerticalIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="mt-4 text-grey-700 text-sm">
        <p>{comment.content}</p>
      </div>
      <div className="mt-4">
        <h4 className="text-grey-900 text-sm font-bold mb-1">What went well</h4>
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
    </li>
  );
}
