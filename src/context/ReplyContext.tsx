import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

interface ReplyContextType {
  isReplying: boolean;
  openReply: () => void;
  closeReply: () => void;
}

const ReplyContext = createContext<ReplyContextType | undefined>(undefined);

export const ReplyProvider = ({ children }: { children: ReactNode }) => {
  const [replyCount, setReplyCount] = useState(0);

  const openReply = useCallback(() => setReplyCount((n) => n + 1), []);
  const closeReply = useCallback(
    () => setReplyCount((n) => Math.max(0, n - 1)),
    [],
  );

  return (
    <ReplyContext.Provider
      value={{ isReplying: replyCount > 0, openReply, closeReply }}
    >
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
