import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

const LEEWAY = 60;

async function refreshKeycloakToken(token: any) {
  try {
    const params = new URLSearchParams({
      client_id: process.env.AUTH_KEYCLOAK_ID!,
      client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const issuer = process.env.AUTH_KEYCLOAK_ISSUER!;
    const res = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    if (!res.ok) throw new Error("RefreshTokenRequestFailed");
    const data = await res.json();

    const now = Math.floor(Date.now() / 1000);

    return {
      ...token,
      accessToken: data.access_token,
      idToken: data.id_token ?? token.idToken,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: now + (data.expires_in ?? 300) - LEEWAY,
      refreshExpiresAt: data.refresh_expires_in
        ? now + data.refresh_expires_in - LEEWAY
        : token.refreshExpiresAt,
      error: undefined,
    };
  } catch (e) {
    return { ...token, error: "RefreshTokenError" as const };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
      authorization: {
        params: { scope: "openid profile email patientId" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const now = Math.floor(Date.now() / 1000);
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.provider = account.provider;
        token.expiresAt = (account.expires_at ?? now + 300) - LEEWAY;
        token.refreshExpiresAt =
          now + (account as any).refresh_expires_in - LEEWAY;
        token.name = `${(profile as any).family_name ?? ""} ${
          (profile as any).given_name ?? ""
        }`.trim();
        token.patientId = (profile as any).patientId;
        token.userId = account.providerAccountId;
        return token;
      }

      const now = Math.floor(Date.now() / 1000);
      if (token.refreshExpiresAt && now >= (token.refreshExpiresAt as number)) {
        return { ...token, error: "RefreshTokenExpired" as const };
      }
      if (now < (token.expiresAt as number)) return token;

      // Hết hạn → refresh
      if (token.refreshToken) {
        return await refreshKeycloakToken(token);
      }
      return { ...token, error: "NoRefreshTokenError" as const };
    },

    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).idToken = token.idToken;
      (session as any).error = token.error;
      session.expiresAt = token.expiresAt as number;
      session.user.patientId = (token as any).patientId;
      session.user.id = (token as any).userId;
      return session;
    },
  },
});
