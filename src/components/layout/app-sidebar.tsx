'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileHeart,
  ScanHeart,
  CalendarHeart,
  SquareActivity,
  Hospital,
} from 'lucide-react';
import BrandHeader from './brand';
import MySidebarMenuItem from './sidebar-menu-item';

export interface MenuItem {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
}
const patientMenu: MenuItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/patient' },
  {
    label: 'Hồ sơ sức khoẻ',
    icon: FileHeart,
    href: '/patient/health-profile',
  },
  { label: 'Khám từ xa', icon: ScanHeart, href: '/patient/telehealth' },
  { label: 'Lịch hẹn', icon: CalendarHeart, href: '/patient/appointments' },
  {
    label: 'Xét nghiệm',
    icon: SquareActivity,
    href: '/patient/lab-reports',
  },
];

const practitionerMenu: MenuItem[] = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/practitioner' },
  {
    label: 'Lịch khám',
    icon: CalendarHeart,
    href: '/practitioner/appointments',
  },
  {
    label: 'Bệnh nhân',
    icon: ScanHeart,
    href: '/practitioner/patients',
  },
  {
    label: 'Hồ sơ hành nghề',
    icon: FileHeart,
    href: '/practitioner/profiles',
  },
  {
    label: 'Cở y tế',
    icon: Hospital,
    href: '/practitioner/organization',
  },
];

export function AppSidebar({ role }: { role: 'patient' | 'practitioner' }) {
  const menuList = role === 'patient' ? patientMenu : practitionerMenu;
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="overflow-hidden">
        <BrandHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {menuList.map((item) => (
              <MySidebarMenuItem key={item.href} {...item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
