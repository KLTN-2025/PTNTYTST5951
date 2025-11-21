import { fetcher } from '@/libs/fetcher';
import { ImageAsset } from '@/types/api';
import { useMutation } from '@tanstack/react-query';

export const useUploadAssetImageMutation = (p0: {
  onSuccess: (uploadedImageData: any) => void;
}) => {
  return useMutation({
    mutationFn: (input: FormData) =>
      fetcher<ImageAsset>('/assets/images', {
        method: 'POST',
        body: input,
      }),
  });
};
