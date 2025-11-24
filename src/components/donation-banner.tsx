import { HeartIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const donationLink =
  "https://opencollective.com/streetlives#category-CONTRIBUTE";

const DonationBanner = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white">
      <div className="bg-yellow/10">
        <div className="py-2.5 px-5 max-w-5xl mx-auto flex space-x-2">
          <span>
            <HeartIcon className="w-6 h-6 mt-1 md:mt-1.5 text-amber-300" />
          </span>
          <div className="flex-1">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <p className="text-sm">
                <a
                  href={donationLink}
                  target="_blank"
                  className="text-blue font-medium underline"
                >
                  Donate now
                </a>
                <span>, support real-time help in NYC</span>
              </p>

              <button className="p-1">
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: "inline-flex" }}
                >
                  <ChevronDownIcon className="w-5 h-5" />
                </motion.span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  key="donation-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                  style={{ willChange: "height, opacity" }}
                >
                  <div className="pt-1">
                    <p className="text-sm text-neutral-700">
                      Thank you! You&apos;re making it easier for more New
                      Yorkers to find the services they need.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationBanner;
