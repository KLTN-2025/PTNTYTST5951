import { NextResponse } from 'next/server';
import { auth, REFRESH_TOKEN_ERROR, TOKEN_ERROR } from './auth';

const signInUrl = '/api/auth/signin';

export default auth(async (req) => {
  const { nextUrl } = req;
  if (
    !req.auth ||
    req.auth?.error === REFRESH_TOKEN_ERROR ||
    req.auth?.error === TOKEN_ERROR
  ) {
    const signInWithRedirectUrl = new URL(signInUrl, nextUrl.origin);
    signInWithRedirectUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(signInWithRedirectUrl);
  }
  if (nextUrl.pathname.startsWith('/register')) {
    if (
      req.auth?.user?.fhir?.patient &&
      nextUrl.pathname === '/register/patient'
    ) {
      const appUrl = new URL('/patient', nextUrl.origin);
      return NextResponse.redirect(appUrl);
    }
    if (
      req.auth?.user?.fhir?.practitioner &&
      nextUrl.pathname === '/register/practitioner'
    ) {
      const appUrl = new URL('/practitioner', nextUrl.origin);
      return NextResponse.redirect(appUrl);
    }
  }
  if (nextUrl.pathname.startsWith('/patient')) {
    if (!req.auth?.user?.fhir?.patient) {
      const setupUrl = new URL('/register/patient', nextUrl.origin);
      return NextResponse.redirect(setupUrl);
    }
    if (!req.auth?.user?.roles?.includes('Patient')) {
      const forbiddenUrl = new URL('/app/forbidden', nextUrl.origin);
      return NextResponse.redirect(forbiddenUrl);
    }
  }
  if (nextUrl.pathname.startsWith('/practitioner')) {
    if (!req.auth?.user?.fhir?.practitioner) {
      const setupUrl = new URL('/register/practitioner', nextUrl.origin);
      return NextResponse.redirect(setupUrl);
    }
    if (!req.auth?.user?.roles?.includes('Practitioner')) {
      const forbiddenUrl = new URL('/app/forbidden', nextUrl.origin);
      return NextResponse.redirect(forbiddenUrl);
    }
  }
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!req.auth?.user?.roles?.includes('Admin')) {
      const forbiddenUrl = new URL('/app/forbidden', nextUrl.origin);
      return NextResponse.redirect(forbiddenUrl);
    }
  }
  return NextResponse.next();
});

// Áp dụng middleware cho tất cả đường dẫn /app/*
export const config = {
  matcher: [
    //? Role path
    '/admin/:path*',
    '/patient/:path*',
    '/practitioner/:path*',

    //? Action path
    '/register/:path*',
  ],
};
