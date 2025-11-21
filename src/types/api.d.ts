import { Questionnaire, Address } from 'fhir/r4';

export interface PatientInfo {
  id: string;
  email: string;
  phone: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
}

export type BeetaminInitHealthProfile = {
  questionnaire: Questionnaire;
  populatedContext: Record<string, any>;
  populatedResponse: QuestionnaireResponse;
};

export type BasicCodeSystem = {
  system: string;
  code: string;
  display: string;
  children?: BasicCodeSystem[];
};

export type Practitioner = {
  id: string;
  name: string;
  phone: string;
  email: string;
  citizenIdentification: string;
  gender: 'male' | 'female';
  birthDate: string;
  photo?: string;
  qualifications?: string[];
};

export type ImageAsset = {
  url: string;
  contentType: string;
};

export type UpdatePractitionerQualificationParams = {
  qualificationId?: string;
  documentId?: string;
  selectedDocumentTypeCode: Coding;
  selectedDocumentTypeChildCode: Coding;
  placeOfIssue: string;
  issueDate: string;
  documentImages: { url: string; contentType: string }[];
};

export type PractitionerQualification = {
  id?: string;
  documentId?: string;
  status?: string;
  docStatus?: string;
  documentTypeCode: Coding;
  documentSubTypeCode: Coding;
  placeOfIssue: string;
  issueDate: string;
  documentImages: { url: string; contentType: string }[];
  1;
};

export type PractitionerOrganization = {
  isOrganizationActive: boolean;
  organizationName: string | undefined;
  organizationType: CodeableConcept[] | undefined;
  organizationAddress: Address | undefined;
  organizationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  organizationTelecom: {
    phone?: string;
    email?: string;
    url?: string;
  };
  practitionerRoleId: string | undefined;
  organizationId: string;
  isPractitionerRoleActive: boolean;
  roles: {
    coding: Coding[] | undefined;
    text: string | undefined;
  }[];
};
