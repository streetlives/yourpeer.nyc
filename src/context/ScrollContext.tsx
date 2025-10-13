import React, { createContext, useContext, useRef } from "react";

type ScrollContextType = React.RefObject<HTMLUListElement | null> | null;

const ScrollContext = createContext<ScrollContextType>(null);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const containerRef = useRef<HTMLUListElement | null>(null);

  return (
    <ScrollContext.Provider value={containerRef}>
      {children}
    </ScrollContext.Provider>
  );
};

// Custom hook for consuming the scroll container ref
export const useScrollContainer =
  (): React.RefObject<HTMLUListElement | null> | null =>
    useContext(ScrollContext);
