import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    expiresAt?: unknown;
    idToken?: string;
    error?: unknown;
    user: DefaultUser & {
      id?: string;
      patientId?: string;
    };
  }
}
