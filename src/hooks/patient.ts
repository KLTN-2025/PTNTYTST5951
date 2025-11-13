import { IdentityInfoFormData } from '@/components/form/register-profile';
import { fetcher } from '@/libs/fetcher';
import { BeetaminInitHealthProfile, PatientInfo } from '@/types/api';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePatient = () => {
  return useQuery({
    queryKey: ['patient'],
    queryFn: () => fetcher<PatientInfo>('/patients/me'),
    staleTime: Infinity,
  });
};

export const useSetupNewPatientMutation = () => {
  return useMutation({
    mutationFn: (input: IdentityInfoFormData) =>
      fetcher<{ id: string }>('/identities/patient', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
};
