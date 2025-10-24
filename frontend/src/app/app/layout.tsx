import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full flex flex-col p-2">
          <div className="p-2">
            <SidebarTrigger />
          </div>
          <div className="w-full p-2">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default AppLayout;
