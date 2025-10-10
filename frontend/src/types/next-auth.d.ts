import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

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
