"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LocationDetailLoadingSkeletonContent } from "./location-detail-loading-skeleton";

export default function LocationDetailLoadingPanel() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : {
              x: 48,
              opacity: 0,
            }
      }
      animate={
        shouldReduceMotion
          ? { opacity: 1 }
          : {
              x: 0,
              opacity: 1,
            }
      }
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="details-screen bg-white md:flex z-50 fixed md:absolute inset-0 w-full h-full overflow-y-auto flex flex-col"
    >
      <LocationDetailLoadingSkeletonContent />
    </motion.div>
  );
}
