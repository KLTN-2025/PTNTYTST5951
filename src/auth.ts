import NextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import type { JWT } from 'next-auth/jwt';
import * as jose from 'jose';

export const REFRESH_TOKEN_ERROR = 'RefreshAccessTokenError' as const;
export const TOKEN_ERROR = 'TokenError' as const;

const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (
  !KEYCLOAK_ISSUER ||
  !KEYCLOAK_CLIENT_ID ||
  !KEYCLOAK_CLIENT_SECRET ||
  !API_URL ||
  !NEXTAUTH_URL ||
  !NEXTAUTH_SECRET
) {
  throw new Error('Missing required auth environment variables');
}

console.log('[AUTH] NEXTAUTH_URL', process.env.NEXTAUTH_URL);
const isTokenValid = (token: JWT): boolean =>
  !!token.accessToken &&
  typeof token.accessTokenExpires === 'number' &&
  Date.now() < token.accessTokenExpires;

const withError = (token: JWT, error: JWT['error']): JWT => ({
  ...token,
  accessToken: undefined,
  accessTokenExpires: undefined,
  refreshToken: undefined,
  error,
});

const extractClientRoles = (payload: any, clientId: string) => {
  return payload?.resource_access?.[clientId]?.roles ?? [];
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.log('No refresh token available');
    return withError(token, REFRESH_TOKEN_ERROR);
  }

  try {
    const url = `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    });

    if (KEYCLOAK_CLIENT_SECRET) {
      params.set('client_secret', KEYCLOAK_CLIENT_SECRET);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.log('Failed to refresh access token', await res.text());
      return withError(token, REFRESH_TOKEN_ERROR);
    }

    const data = await res.json();
    const now = Date.now();
    const expiresInSec = Number(data.expires_in ?? 300);

    return {
      ...token,
      accessToken: data.access_token ?? token.accessToken,
      accessTokenExpires: now + expiresInSec * 1000 - 5000,
      refreshToken: data.refresh_token ?? token.refreshToken,
      idToken: data.id_token ?? token.idToken,
      error: undefined,
      patient: token.patient,
    };
  } catch {
    console.log('Error occurred while refreshing access token');
    return withError(token, REFRESH_TOKEN_ERROR);
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },

  providers: [
    Keycloak({
      clientId: KEYCLOAK_CLIENT_ID!,
      clientSecret: KEYCLOAK_CLIENT_SECRET!,
      issuer: KEYCLOAK_ISSUER,
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && token) {
        console.log(account, profile);
        if (account.access_token) {
          const expiresInSec =
            typeof account.expires_in === 'number' ? account.expires_in : 300;
          const expiresAt = Date.now() + expiresInSec * 1000 - 5000;
          const payloadJson = jose.decodeJwt(account.access_token!);
          const clientRoles = extractClientRoles(
            payloadJson,
            KEYCLOAK_CLIENT_ID
          );
          return {
            ...token,
            name: profile?.name ?? token.name,
            email: profile?.email ?? token.email,
            sub: account.providerAccountId ?? token.sub,
            accessToken: account.access_token,
            accessTokenExpires: expiresAt,
            refreshToken: account.refresh_token,
            roles: clientRoles,
            idToken: account.id_token,
            error: undefined,
            fhir: profile?.fhir ?? token.fhir,
          };
        }
        return token;
      }
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub ?? session.user?.id,
        name: token.name ?? session.user?.name,
        roles: token.roles ?? session.user?.roles,
        email: token.email ?? session.user?.email,
        fhir: token.fhir ?? session.user?.fhir,
      };

      session.accessToken = token.accessToken;
      if (token.error) {
        session.error = token.error;
      }
      return session;
    },
  },

  events: {
    async signOut(message) {
      const token =
        'token' in message ? (message.token as JWT | undefined) : undefined;
      const issuer = KEYCLOAK_ISSUER?.replace(/\/+$/, '');

      if (!issuer || !token?.idToken) return;

      const endSessionEndpoint = `${issuer}/protocol/openid-connect/logout`;

      const params = new URLSearchParams({
        id_token_hint: token.idToken,
        post_logout_redirect_uri: NEXTAUTH_URL!,
      });

      try {
        await fetch(`${endSessionEndpoint}?${params.toString()}`, {
          cache: 'no-store',
        });
      } catch {
        console.log('Error occurred while signing out from Keycloak');
      }
    },
  },
});
