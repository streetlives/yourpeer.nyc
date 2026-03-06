"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

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
      className="details-screen bg-white md:flex z-50 md:z-0 fixed md:absolute inset-0 w-full h-full overflow-y-auto flex flex-col"
    >
      <div className="h-14 border-b border-neutral-200 px-4 flex items-center gap-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-full" />
      </div>

      <div className="p-4 space-y-4">
        <Skeleton className="h-7 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full" />
      </div>

      <div className="px-4 pb-6 space-y-3">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-11/12 rounded-full" />
        <Skeleton className="h-4 w-10/12 rounded-full" />
        <Skeleton className="h-10 w-full rounded-full mt-4" />
      </div>
    </motion.div>
  );
}
