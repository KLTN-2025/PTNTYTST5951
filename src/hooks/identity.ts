import { IdentityInfoFormData } from '@/components/form/register-profile';
import { fetcher } from '@/libs/fetcher';
import { useMutation } from '@tanstack/react-query';

export const useRegisterNewIdentityMutation = () => {
  return useMutation({
    mutationFn: ({
      role,
      body,
    }: {
      role: 'patient' | 'practitioner';
      body: IdentityInfoFormData;
    }) =>
      fetcher<{ id: string }>(`/identities/${role}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  });
};
