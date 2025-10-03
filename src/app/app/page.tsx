import { getServerSession } from "next-auth";
import Login from "@/components/Login";
import Logout from "@/components/Logout";
import TestComponent from "@/components/test";
export default async function Home() {
  const session = await getServerSession();
  if (session) {
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
