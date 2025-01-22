import ReviewListItem from "@/components/feedback/review-list-item";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function ReviewList() {
  return (
    <div className="bg-neutral-100 h-full relative overflow-y-hidden pt-2">
      {/* reviews list */}
      <ul className="flex flex-col space-y-2 h-full overflow-y-scroll pb-12">
        <ReviewListItem />
        <ReviewListItem />
        <ReviewListItem />
      </ul>
      <div className=" absolute bottom-0 w-full bg-white px-5 py-2">
        <button className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full">
          <PlusCircleIcon className="w-5 h-5 text-white" />
          <span>Add review hello</span>
        </button>
      </div>
    </div>
  );
}
