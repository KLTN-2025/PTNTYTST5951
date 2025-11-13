'use server';
import { signIn, signOut } from '@/auth';

export async function signInKeycloak() {
  await signIn('keycloak', { redirectTo: '/patient/app' });
}

export async function signOutAction(params?: { redirectTo?: string }) {
  await signOut({ redirectTo: params?.redirectTo || '/api/auth/signin' });
}
