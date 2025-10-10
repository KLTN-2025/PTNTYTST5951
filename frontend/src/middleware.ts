import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      return !!token && token.error !== "RefreshAccessTokenError";
    },
  },
});

export const config = {
  matcher: ["/app/:path*"], // bảo vệ mọi route /app/*
};
