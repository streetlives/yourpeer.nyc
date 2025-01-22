import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function ReviewHighlights({
  onViewAll,
  onAddReview,
}: {
  onViewAll: () => void;
  onAddReview: () => void;
}) {
  return (
    <div className="bg-neutral-50 pt-2" id="reviews">
      <div className="bg-white p-4 pt-8">
        <div className="bg-purple/10 rounded-lg px-4 py-3 flex space-x-2">
          <img
            src="/img/icons/group-users-icon.svg"
            className="flex-shrink-0 w-6 h-6 object-contain"
            alt=""
          />
          <div className="pr-6">
            <p className="text-sm mb-2">
              YourPeer works with SCO Family of Services to collect community
              feedback.
            </p>
            <a href="#" className="text-purple text-sm">
              Learn more
            </a>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base text-grey-900">
              Review highlights
            </h3>
            <button className="text-blue text-sm">View all</button>
          </div>
          <ul className="mt-3 flex flex-col space-y-3">
            <li className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
              <span>I like that you get</span>
              <strong className="text-green-800">
                {" "}
                prepared and ready for new jobs and programs.
              </strong>
            </li>
            <li className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
              <span>The</span>{" "}
              <strong className="text-green-800">structure and rules</strong>
              <span>of the program.</span>{" "}
              <strong className="text-green-800">Curfew</strong>
            </li>
            <li className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
              <span>They sent me to a security program and it</span>{" "}
              <strong className="text-red-600">
                wasn&apos;t what I expected it to be.
              </strong>
            </li>
            <li className="bg-grey-100 rounded-3xl px-4 py-3 text-sm md:text-balance text-grey-900">
              <strong className="text-red-600">Better communication</strong>{" "}
              <span>skills between staff and residents.</span>{" "}
              <strong className="text-red-600">More job</strong>{" "}
              <span>opportunities.</span>{" "}
              <strong className="text-red-600">Bathroom conditions, AC</strong>
            </li>
          </ul>

          <div className="mt-4">
            <button
              onClick={onAddReview}
              className=" flex items-center justify-center space-x-2 py-2 px-4 text-white font-medium bg-purple rounded-full w-full"
            >
              <PlusCircleIcon className="w-5 h-5 text-white" />
              <span>Add review</span>
            </button>
            <button
              onClick={onViewAll}
              className="mt-3 flex items-center justify-center py-2 px-4 space-x-2 text-grey-900 font-medium bg-white border border-neutral-300 rounded-full w-full"
            >
              View all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
