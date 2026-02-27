"use client";

import { useEffect, useState } from "react";

export const SMALL_SCREEN_WIDTH = 768;

export function useScreenWidth(): number {
  const [screenWidth, setScreenWidth] = useState<number>(0);
  useEffect(() => {
    setScreenWidth(window.innerWidth);
    window.addEventListener("resize", () => {
      setScreenWidth(window.innerWidth);
    });
  }, []);
  return screenWidth;
}
