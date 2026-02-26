"use client";

import React, { PropsWithChildren, useRef } from "react";
import DonationBanner from "../donation-banner";

type section = "info" | "reviews" | "services";

interface Props {
  onChangeSection: (section: section) => void;
  onSticky: (sticky: boolean) => void;
}

export default function LocationDetailContainer({
  children,
  onSticky,
  onChangeSection,
}: PropsWithChildren<Props>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sections: section[] = ["info", "reviews", "services"];

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (target.scrollTop > 30) {
      onSticky(true);
    } else {
      onSticky(false);
    }

    const container = containerRef.current;

    if (!container) return;

    // Find the section that is currently in view
    let currentSection: section = "info";

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        const offsetTop = section.offsetTop - container.offsetTop - 120;
        const offsetBottom = offsetTop + section.offsetHeight;
        if (
          container.scrollTop >= offsetTop &&
          container.scrollTop < offsetBottom
        ) {
          currentSection = sectionId;
        } else if (container.scrollTop < 600) {
          currentSection = sections[0];
        }
      }
    });
    onChangeSection(currentSection);
  };

  return (
    <div
      className="details-screen bg-white md:flex z-50 md:z-0 fixed md:absolute inset-0 w-full h-full overflow-y-auto scroll-smooth flex flex-col"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <div className="md:hidden">
        <DonationBanner />
      </div>
      <div>{children}</div>
    </div>
  );
}
