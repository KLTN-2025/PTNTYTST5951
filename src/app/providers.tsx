"use client";
import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/query-client";
import { SessionProvider } from "next-auth/react";

export default function Providers({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: DehydratedState | null | undefined;
}) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={state}>{children}</HydrationBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
