"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { makeAxios } from "@/lib/axios";

export function useApi(baseURL?: string) {
  const { data: session } = useSession();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.user?.accessToken ||
    undefined;

  return useMemo(() => makeAxios(token, baseURL), [token, baseURL]);
}
