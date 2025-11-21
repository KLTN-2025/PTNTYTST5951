'use client';
import { useQueryGetMyOrganizations } from '@/hooks/practitioner';
import { PractitionerOrganization } from '@/types/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

import React from 'react';

const OrganiztionContainer = ({
  title,
  organizations,
  isAddAvailable,
}: {
  title: string;
  organizations: PractitionerOrganization[];
  isAddAvailable?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2>{title}</h2>
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
        {organizations.map((organization) => (
          <div
            key={organization.organizationId}
            className="border-2 border-gray-300 rounded-lg p-4 grid grid-cols-3 gap-2 hover:shadow-md hover:border-gray-500 cursor-pointer"
          >
            <h1 className="font-semibold text-primary col-span-2 text-lg overflow-hidden text-ellipsis whitespace-nowrap">
              {organization.organizationName}
            </h1>
            <div className="flex flex-row gap-2 justify-end">
              <Badge className="px-2 py-0.5 text-sm h-7">
                {organization.organizationStatus === 'pending'
                  ? 'Chờ xác minh'
                  : organization.organizationStatus === 'approved'
                  ? 'Đã xác minh'
                  : organization.organizationStatus === 'rejected'
                  ? 'Bị từ chối'
                  : organization.organizationStatus === 'suspended'
                  ? 'Bị đình chỉ'
                  : 'Trạng thái khác'}
              </Badge>
              <Badge
                variant={
                  organization.isOrganizationActive ? 'default' : 'destructive'
                }
                className="px-2 py-0.5 text-sm h-7"
              >
                {organization.isOrganizationActive
                  ? 'Hoạt động'
                  : 'Không hoạt động'}
              </Badge>
            </div>
            <div className="col-span-3 text-sm font-semibold flex flex-row gap-2 flex-wrap">
              {organization.roles.map((role, index) => (
                <span key={index}>{role.text}</span>
              ))}
            </div>
            <p className="col-span-3 text-sm italic overflow-hidden text-ellipsis whitespace-nowrap">
              {organization.organizationAddress?.line},{' '}
              {organization.organizationAddress?.district},{' '}
              {organization.organizationAddress?.state}
            </p>
            <div className="w-full">
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm italic">
                {organization.organizationTelecom.email}
              </span>
            </div>
            <div className="w-full">
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm italic">
                {organization.organizationTelecom.phone}
              </span>
            </div>
            <div className="w-full">
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm italic">
                {organization.organizationTelecom.url}
              </span>
            </div>
          </div>
        ))}
        {isAddAvailable && (
          <Link
            href="/practitioner/register-organization"
            type="button"
            className="w-full rounded-lg border-2 border-dashed border-gray-500 p-4 flex flex-col justify-center items-center hover:bg-gray-100"
          >
            <span className="text-4xl font-bold">+</span>
            <span className="mt-2">Đăng ký cơ sở Y Tế mới</span>
          </Link>
        )}
      </div>
    </div>
  );
};

const OrganizationPage = () => {
  const { data: organizations = [] } = useQueryGetMyOrganizations();
  return (
    <div className="flex flex-col gap-4 w-full">
      <OrganiztionContainer
        title="Cơ sở bạn quản lý"
        isAddAvailable={true}
        organizations={organizations}
      />
      {/* <OrganiztionContainer
        title="Cơ sở bạn tham gia"
        organizations={['org4', 'org5']}
      /> */}
    </div>
  );
};

export default OrganizationPage;
