import { Reply } from "@/components/common";
import moment from "moment/moment";
import { UserIcon } from "@heroicons/react/24/outline";

const ReplyItem = ({ reply, orgName }: { reply: Reply; orgName: string }) => {
  return (
    <div className="mt-3 rounded-3xl p-4 bg-grey-100  ">
      <div className="flex items-center space-x-2">
        <div className="w-9 h-9 flex items-center justify-center text-white bg-amber-500 rounded-full">
          <UserIcon className="w-4 h-4" />
        </div>
        <div>
          <div className=" text-sm text-black font-medium mb-1">{orgName}</div>
          <div className="text-gray-600 text-xs">
            {moment(reply.created_at).format("MMMM Do YYYY")}
          </div>
        </div>
      </div>
      <p className="mt-4 text-dark text-sm">{reply.content}</p>
    </div>
  );
};
export default ReplyItem;
