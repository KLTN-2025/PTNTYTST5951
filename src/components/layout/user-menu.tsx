'use client';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { signOutAction } from '@/actions/auth';
import { usePatient } from '@/hooks/patient';

const UserMenu = () => {
  const { data: patientInfo } = usePatient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${patientInfo?.name}`}
            alt={`@avatar-${patientInfo?.email}`}
          />
          <AvatarFallback>BEE</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{patientInfo?.name}</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => signOutAction({ redirectTo: '/login' })}
        >
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
