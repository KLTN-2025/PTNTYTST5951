'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const role = pathname.startsWith('/practitioner')
    ? 'practitioner'
    : 'patient';
  return (
    <div className="w-full min-h-screen flex flex-col">
      <SidebarProvider>
        <AppSidebar role={role} />
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
