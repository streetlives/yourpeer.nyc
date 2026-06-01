"use client";

import { ReplyProvider } from "@/context/ReplyContext";
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

const QueryClientProvider = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      <ReplyProvider>{children}</ReplyProvider>
    </ReactQueryClientProvider>
  );
};

export default QueryClientProvider;
