import { Reply } from "@/components/common";
import moment from "moment/moment";

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
export default ReplyItem;
