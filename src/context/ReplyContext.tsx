import React, { createContext, useContext, useState, ReactNode } from "react";

interface ReplyContextType {
  isReplying: boolean;
  setIsReplying: React.Dispatch<React.SetStateAction<boolean>>;
  toggleReply: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

export const ReplyProvider = ({ children }: { children: ReactNode }) => {
  const [isReplying, setIsReplying] = useState(false);

  const toggleReply = () => setIsReplying((prev) => !prev);

  return (
    <ReplyContext.Provider value={{ isReplying, setIsReplying, toggleReply }}>
      {children}
    </ReplyContext.Provider>
  );
};

export const useReply = () => {
  const context = useContext(ReplyContext);
  if (!context) {
    throw new Error("useReply must be used within a ReplyProvider");
  }
  return context;
};
