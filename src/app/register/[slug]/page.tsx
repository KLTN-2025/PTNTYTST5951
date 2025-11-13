'use client';
import { notFound } from 'next/navigation';
import { use } from 'react';
import {
  IdentityInfoFormData,
  RegisterProfileForm,
} from '@/components/form/register-profile';
import { useRegisterNewIdentityMutation } from '@/hooks/identity';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  if (slug !== 'practitioner' && slug !== 'patient') return notFound();
  const { data: session } = useSession();
  const [formDefaultValues, setFormDefaultValues] =
    useState<IdentityInfoFormData | null>(null);
  const {
    mutate: registerNewIdentity,
    isPending: isRegistering,
    isSuccess: isRegistered,
    isError: isRegisterError,
    error: registerError,
  } = useRegisterNewIdentityMutation();
  useEffect(() => {
    if (session) {
      const defaultValues: IdentityInfoFormData = {
        citizenIdentification: '',
        phone: '',
        email: session.user.email || '',
        name: session.user.name || '',
        gender: 'male',
        birthdate: new Date(),
      };
      setFormDefaultValues(defaultValues);
    }
  }, [session]);
  useEffect(() => {
    if (isRegistered) {
      toast.success('Đăng ký thành công. Vui lòng đăng nhập lại để sử dụng.');
      signOut({ callbackUrl: `/${slug}` });
    }
    if (isRegisterError) {
      toast.error(`Đăng ký thất bại.`);
    }
  }, [isRegistered, isRegisterError]);
  const onSubmit = async (values: IdentityInfoFormData) => {
    registerNewIdentity({ role: 'practitioner', body: values });
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      {formDefaultValues ? (
        <RegisterProfileForm
          id="practitioner-register-form"
          submitError={registerError}
          defaultValues={formDefaultValues}
          isSubmitting={isRegistering}
          onSubmit={onSubmit}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
