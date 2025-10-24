import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function fetcher(input: string, init?: RequestInit) {
  const session = await getSession();
  const accessToken = (session as any)?.accessToken as string | undefined;

  const res = await fetch(`${API}${input}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      redirect("/signin");
    }
    const error = await res.json();
    error.error = JSON.parse(error.error);
    throw error;
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
