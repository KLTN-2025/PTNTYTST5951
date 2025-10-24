"use server";
import { signIn, signOut, auth } from "@/auth";

const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
const nextauthUrl = process.env.NEXTAUTH_URL;

const fetchSignOut = async () => {
  if (!issuer || !nextauthUrl) {
    throw new Error("AUTH_KEYCLOAK_ISSUER or NEXTAUTH_URL is not defined");
  }
  const session = await auth().catch(() => null);
  if (!session) {
    return;
  }
  const { idToken } = session;
  console.log(session);
  const logoutUrl = new URL(`${issuer}/protocol/openid-connect/logout`);
  logoutUrl.search = new URLSearchParams({
    id_token_hint: idToken as string,
    post_logout_redirect_uri: nextauthUrl,
  }).toString();
  return await fetch(logoutUrl.toString());
};

export async function signInKeycloak() {
  await fetchSignOut();
  await signIn("keycloak", { redirectTo: "/app" });
}

export async function signOutAction(params?: { redirectTo?: string }) {
  await fetchSignOut();
  await signOut({ redirectTo: params?.redirectTo || "/" });
}
