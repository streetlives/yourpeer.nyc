import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import QuickExitLink from "@/components/quick-exit";

interface Props {
  onGoBack: () => void;
  isSticky: boolean;
  title: string | null;
}

export default function LocationDetailHeader({
  onGoBack,
  isSticky,
  title,
}: Props) {
  return (
    <div className="flex-shrink-0 h-14 px-4 gap-x-2 flex justify-between md:justify-start items-center bg-white sticky z-20 top-0 left-0 w-full right-0">
      <button
        className="text-dark hover:text-black transition flex-shrink-0"
        id="details_back"
        onClick={onGoBack}
        style={{ cursor: "pointer" }}
      >
        <ArrowLeftIcon className="size-6" />
      </button>

      <Transition show={isSticky}>
        <h1
          className="text-dark text-lg sm:text-xl font-medium truncate details-scroll-header transition duration-300 ease-in data-[closed]:opacity-0"
          translate="no"
        >
          {title}
        </h1>
      </Transition>

      <span className="md:hidden">
        <QuickExitLink />
      </span>
    </div>
  );
}
