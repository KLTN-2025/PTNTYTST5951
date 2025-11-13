'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileHeart,
  ScanHeart,
  CalendarHeart,
  SquareActivity,
} from 'lucide-react';
import BrandHeader from './brand';
import MySidebarMenuItem from './sidebar-menu-item';

export interface MenuItem {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
}
const menuItems: MenuItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/patient/app' },
  {
    label: 'Hồ sơ sức khoẻ',
    icon: FileHeart,
    href: '/patient/app/health-profile',
  },
  { label: 'Khám từ xa', icon: ScanHeart, href: '/patient/app/telehealth' },
  { label: 'Lịch hẹn', icon: CalendarHeart, href: '/patient/app/appointments' },
  {
    label: 'Xét nghiệm',
    icon: SquareActivity,
    href: '/patient/app/lab-reports',
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="overflow-hidden">
        <BrandHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuItems.map((item) => (
              <MySidebarMenuItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
