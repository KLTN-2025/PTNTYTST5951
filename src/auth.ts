import NextAuth, { AuthOptions, DefaultSession } from "next-auth";
import { DefaultJWT, JWT } from "next-auth/jwt";
import Keycloak from "next-auth/providers/keycloak";

// Validate environment variables
if (!process.env.KEYCLOAK_CLIENT_ID) {
  throw new Error("Missing KEYCLOAK_CLIENT_ID environment variable");
}
if (!process.env.KEYCLOAK_CLIENT_SECRET) {
  throw new Error("Missing KEYCLOAK_CLIENT_SECRET environment variable");
}
if (!process.env.KEYCLOAK_ISSUER) {
  throw new Error("Missing KEYCLOAK_ISSUER environment variable");
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    error?: "RefreshAccessTokenError";
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    provider?: string;
    idToken?: string;
    user?: any;
    error?: "RefreshAccessTokenError";
  }
}

const refreshAccessToken = async (token: import("next-auth/jwt").JWT) => {
  try {
    if (!token.refreshToken) {
      return { ...token, error: "RefreshAccessTokenError" as const };
    }

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
      // (tùy) next: { revalidate: 0 } nếu đang ở môi trường edge
    });

    const refreshed = await response.json();
    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (e) {
    console.error("refreshAccessToken error", e);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
};

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        console.log("Account", account);
        console.log("User", user);
        console.log("Token", token);
        // Initial sign in
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + Number(account.expires_in) * 1000,
          refreshToken: account.refresh_token,
          provider: account.provider,
          idToken: account.id_token,
          user,
        };
      }

      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 10000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user = token.user;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.provider === "keycloak" && token.idToken) {
        const keycloakIssuer = process.env.KEYCLOAK_ISSUER;
        const keycloakNextAuthUrl = process.env.NEXTAUTH_URL;
        if (keycloakIssuer && keycloakNextAuthUrl) {
          const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?id_token_hint=${
            token.idToken
          }&post_logout_redirect_uri=${encodeURIComponent(
            keycloakNextAuthUrl
          )}`;
          await fetch(logoutUrl);
        } else {
          console.error(
            "KEYCLOAK_ISSUER or NEXTAUTH_URL is not defined in environment variables."
          );
        }
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
