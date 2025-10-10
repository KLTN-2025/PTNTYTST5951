"use client";
import { useSession } from "next-auth/react";
import Login from "@/components/Login";
import Logout from "@/components/Logout";
import TestComponent from "@/components/test";
export default function Home() {
  const { data: session } = useSession();
  if (session) {
    console.log("Session", session);
    return (
      <div>
        <div>Your name is {session.user?.name}</div>
        <div>
          <TestComponent />
        </div>
        <div>
          <Logout />
        </div>
      </div>
    );
  }
  return (
    <div>
      <Login />
      <div>
        <Logout />
      </div>
    </div>
  );
}
