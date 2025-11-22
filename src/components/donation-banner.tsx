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
            <div className="flex items-center justify-between">
              {isExpanded ? (
                <p className="text-sm text-gray-800 font-medium">
                  Help us keep going
                </p>
              ) : (
                <p className="text-sm">
                  <a
                    href={donationLink}
                    target="_blank"
                    className="text-blue underline"
                  >
                    Donate here
                  </a>{" "}
                  <span>to help us keep going.</span>
                </p>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="p-1"
              >
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
                  <div className="pt-2">
                    <p className="text-sm text-neutral-700">
                      <a
                        href={donationLink}
                        target="_blank"
                        className="underline text-blue"
                      >
                        Donate here.
                      </a>
                      <br />
                      <span>
                        Or email team@streetlives.nyc about relevant funding
                        opportunities.
                      </span>
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
