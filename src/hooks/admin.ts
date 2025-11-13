import { fetcher } from '@/libs/fetcher';
import { useQuery } from '@tanstack/react-query';

export const useGetAdmin = () => {
  return useQuery({
    queryKey: ['admin'],
    queryFn: () => fetcher('/admins/me'),
    // staleTime: Infinity,
  });
};
