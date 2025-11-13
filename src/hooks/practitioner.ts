import { UserInitInfoFormData } from '@/components/form/register-profile';
import { fetcher } from '@/libs/fetcher';
import { useMutation } from '@tanstack/react-query';

export const useSetupNewPatientMutation = () => {
  return useMutation({
    mutationFn: (input: UserInitInfoFormData) =>
      fetcher<{ id: string }>('/identities/practitioner', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
};
