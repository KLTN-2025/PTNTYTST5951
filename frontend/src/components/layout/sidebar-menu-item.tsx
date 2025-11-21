'use client';
import { MenuItem } from './app-sidebar';
import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const MySidebarMenuItem = (item: MenuItem) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton className="[&>svg]:size-8" size="lg" asChild>
        <Link href={item.href}>
          <item.icon color={isActive ? '#ff914d' : '#333333'} />
          <span
            className={
              isActive ? 'text-[#ff914d] font-bold' : 'text-foreground'
            }
          >
            {item.label}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default MySidebarMenuItem;
