"use client";
import {
  QueryClientProvider,
  HydrationBoundary,
  DehydratedState,
  QueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export default function Providers({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: DehydratedState | null | undefined;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );
  return (
    <SessionProvider>
      <QueryClientProvider client={client}>
        <HydrationBoundary state={state}>{children}</HydrationBoundary>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
