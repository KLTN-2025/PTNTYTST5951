import { Address, CodeableConcept, Coding } from 'fhir/r4';

export class PractitionerOrganizationDto {
  isOrganizationActive: boolean;
  organizationName: string | undefined;
  organizationStatus: string | undefined;
  organizationType: CodeableConcept[] | undefined;
  organizationAddress: Address | undefined;
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
}
