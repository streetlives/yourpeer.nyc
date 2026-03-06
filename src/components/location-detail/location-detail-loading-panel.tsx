"use client";

import { motion, useReducedMotion } from "framer-motion";
import LocationDetailLoadingSkeleton from "./location-detail-loading-skeleton";

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
    >
      <LocationDetailLoadingSkeleton />
    </motion.div>
  );
}
