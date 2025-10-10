"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <button onClick={() => signIn("keycloak")}>Đăng nhập với Keycloak</button>
  );
}
