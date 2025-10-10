import NextAuth, { AuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

if (!process.env.KEYCLOAK_CLIENT_ID)
  throw new Error("Missing KEYCLOAK_CLIENT_ID");
if (!process.env.KEYCLOAK_CLIENT_SECRET)
  throw new Error("Missing KEYCLOAK_CLIENT_SECRET");
if (!process.env.KEYCLOAK_ISSUER) throw new Error("Missing KEYCLOAK_ISSUER");

const refreshAccessToken = async (token: import("next-auth/jwt").JWT) => {
  try {
    if (!token.refreshToken)
      return { ...token, error: "RefreshAccessTokenError" as const };

    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const body = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const refreshed = await response.json();
    if (!response.ok) {
      // invalid_grant / 401 → buộc login lại
      return {
        ...token,
        accessToken: undefined,
        refreshToken: undefined,
        error: "RefreshAccessTokenError" as const,
      };
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires:
        Date.now() + Number(refreshed.expires_in ?? 300) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (e) {
    if (process.env.NODE_ENV !== "production")
      console.error("refreshAccessToken error", e);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
};

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const expiresIn =
          account.expires_in !== undefined ? Number(account.expires_in) : 300;
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + expiresIn * 1000,
          refreshToken: account.refresh_token,
          provider: account.provider,
          idToken: account.id_token,
          user,
          error: undefined,
        };
      }
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 10_000
      ) {
        return token;
      }
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        if (token.user) session.user = token.user as any;
        session.accessToken = token.accessToken as string | undefined;
        session.error = token.error as any;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.provider === "keycloak" && token.idToken) {
        const issuer = process.env.KEYCLOAK_ISSUER;
        const appUrl = process.env.NEXTAUTH_URL;
        if (issuer && appUrl) {
          const u = new URL(`${issuer}/protocol/openid-connect/logout`);
          u.search = new URLSearchParams({
            id_token_hint: token.idToken as string,
            post_logout_redirect_uri: appUrl,
          }).toString();
          await fetch(u.toString());
        } else if (process.env.NODE_ENV !== "production") {
          console.error("Missing KEYCLOAK_ISSUER or NEXTAUTH_URL");
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
