import { IdentityInfoFormData } from '@/components/form/register-profile';
import { fetcher } from '@/libs/fetcher';
import {
  BasicCodeSystem,
  Practitioner,
  PractitionerOrganization,
  PractitionerQualification,
  UpdatePractitionerQualificationParams,
} from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CodeableConcept, Coding } from 'fhir/r4';

export const useSetupNewPatientMutation = () => {
  return useMutation({
    mutationFn: (input: IdentityInfoFormData) =>
      fetcher<{ id: string }>('/identities/practitioner', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
};

export const usePatientInfoQuery = () => {
  return useQuery({
    queryKey: ['practitioner-info'],
    queryFn: () =>
      fetcher<Practitioner>('/practitioners/me', {
        method: 'GET',
      }),
  });
};

export const useUpdatePractitionerProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: IdentityInfoFormData) =>
      fetcher<Practitioner>('/practitioners/me', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['practitioner-info'], data);
    },
  });
};

export const useGetQualificationDocumentTypes = () => {
  return useQuery({
    queryKey: ['qualification-document-types'],
    queryFn: () =>
      fetcher<BasicCodeSystem[]>(
        '/practitioners/qualification/document-types',
        {
          method: 'GET',
        }
      ),
  });
};

export const useGetPractitionerQualifications = () => {
  return useQuery({
    queryKey: ['practitioner-qualifications'],
    queryFn: () =>
      fetcher<PractitionerQualification[]>('/practitioners/qualifications', {
        method: 'GET',
      }),
  });
};

export const useAddPractitionerQualificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      qualificationId,
      documentId,
      selectedDocumentTypeCode,
      selectedDocumentTypeChildCode,
      placeOfIssue,
      issueDate,
      documentImages,
      type,
    }: UpdatePractitionerQualificationParams & { type: 'add' | 'update' }) => {
      const qualificationType: CodeableConcept = {
        coding: [selectedDocumentTypeCode, selectedDocumentTypeChildCode],
        text: selectedDocumentTypeChildCode.display,
      };
      const documentAttachments = documentImages.map((image) => ({
        contentType: image.contentType,
        url: image.url,
      }));
      const body: any = {
        qualificationType,
        issuer: placeOfIssue,
        periodStart: issueDate,
        documentAttachments,
      };
      if (type === 'update') {
        body.qualificationId = qualificationId;
        body.documentId = documentId;
      }
      const method = type === 'add' ? 'POST' : 'PUT';
      return fetcher<Practitioner>('/practitioners/qualification', {
        method: method,
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      // Invalidate practitioner qualifications query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['practitioner-qualifications'],
      });
    },
  });
};

export const useDeletePractitionerQualificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qualificationId: string) =>
      fetcher<void>(`/practitioners/qualification/${qualificationId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['practitioner-qualifications'],
      });
    },
  });
};

export const useQueryGetMyOrganizations = () => {
  return useQuery({
    queryKey: ['practitioner-organizations'],
    queryFn: () =>
      fetcher<PractitionerOrganization[]>('/practitioners/organizations', {
        method: 'GET',
      }),
  });
};

export const useRegisterPractitionerOrganizationMutation = () => {
  return useMutation({
    mutationFn: (data: any) =>
      fetcher<void>('/practitioners/register-organization', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
};
