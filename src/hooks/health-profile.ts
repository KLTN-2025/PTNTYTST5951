import { fetcher } from '@/libs/fetcher';
import { BeetaminInitHealthProfile } from '@/types/api';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Bundle, FhirResource } from 'fhir/r4';

export const useBeetaminInitHealthProfile = () => {
  return useQuery({
    queryKey: ['beetamin-init-health-profile'],
    queryFn: () =>
      fetcher<BeetaminInitHealthProfile>(
        '/patients/beetamin-init-health-profile'
      ),
    staleTime: Infinity,
  });
};

export const useSaveBeetaminInitHealthProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Bundle<FhirResource>) =>
      fetcher('/patients/beetamin-init-health-profile', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['beetamin-init-health-profile'],
      });
    },
  });
};
