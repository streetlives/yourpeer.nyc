"use client";

import { TranslatableText } from "@/components/translatable-text";

type ExploreServicesButtonProps = {
  className?: string;
};

export default function ExploreServicesButton({
  className = "primary-button",
}: ExploreServicesButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        window.location.assign("/locations");
      }}
    >
      <TranslatableText text="Explore services" />
    </button>
  );
}
