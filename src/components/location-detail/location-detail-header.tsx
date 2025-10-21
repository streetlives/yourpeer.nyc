import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { SignInNavbarLink } from "@/components/sign-in-navbar-link";
import { motion } from "framer-motion";

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

      {isSticky && (
        <motion.h1
          className="text-dark text-lg sm:text-xl flex-1 font-medium truncate details-scroll-header"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          translate="no"
        >
          {title}
        </motion.h1>
      )}

      <span className="md:hidden">
        <SignInNavbarLink />
      </span>
    </div>
  );
}
