import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req: any) => {
  const session = req.auth;
  const url = req.nextUrl.clone();
  if (
    !session ||
    !session.user ||
    session.error ||
    (session.expiresAt && Date.now() > session.expiresAt * 1000)
  ) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  const profileSetupPath = "/setup";
  if (
    !req.nextUrl.pathname.startsWith(profileSetupPath) ||
    !req.nextUrl.pathname.startsWith("/test")
  ) {
    if (!session.user.patientId) {
      url.pathname = profileSetupPath;
      return NextResponse.redirect(url);
    }
  } else {
    if (session.user.patientId) {
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});
export const config = {
  matcher: ["/app/:path*", "/api/proxy/:path*", "/setup"],
};
