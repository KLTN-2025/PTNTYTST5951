import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RegisterOrganizationDto } from './dtos/register-organization.dto';
import {
  Bundle,
  CodeableConcept,
  FhirResource,
  Location,
  Organization,
  Practitioner,
  PractitionerRole,
} from 'fhir/r4';
import { v4 as uuidV4 } from 'uuid';
import { FhirService } from 'src/fhir/fhir.service';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { PractitionerOrganizationDto } from './dtos/practitioner-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly fhirService: FhirService,
    private readonly fhirHelper: FhirHelperService,
  ) {}

  async registerOrganization({
    practitioner,
    organizationData,
    isActive = false,
  }: {
    practitioner: Practitioner;
    organizationData: RegisterOrganizationDto;
    isActive?: boolean;
  }) {
    const { identifier, type, name, telecom, address } = organizationData;
    const newOrganizationId = `urn:uuid:${uuidV4()}`;
    const newLocationId = `urn:uuid:${uuidV4()}`;
    const newPractitionerRoleId = `urn:uuid:${uuidV4()}`;
    const newOrganization: Organization = {
      resourceType: 'Organization',
      active: isActive,
      extension: [
        {
          url: 'http://beetamin.hivevn.net/fhir/StructureDefinition/organization-approval',
          extension: [
            {
              url: 'status',
              valueCode: 'pending',
            },
            {
              url: 'lastChanged',
              valueDateTime: new Date().toISOString(),
            },
          ],
        },
      ],
      identifier: identifier ? [identifier] : [],
      type: [type],
      name,
      telecom: telecom,
      address: [address],
    };
    const locationType: CodeableConcept | undefined =
      type.coding?.[0]?.code === 'hospital'
        ? {
            coding: [
              {
                system:
                  'http://beetamin.hivevn.net/fhir/CodeSystem/location-type',
                code: 'hospital-campus',
                display: 'Hospital Campus',
              },
            ],
          }
        : type.coding?.[0]?.code === 'clinic'
          ? {
              coding: [
                {
                  system:
                    'http://beetamin.hivevn.net/fhir/CodeSystem/location-type',
                  code: 'outpatient-clinic',
                  display: 'Outpatient Clinic',
                },
              ],
            }
          : undefined;
    const newLocation: Location = {
      resourceType: 'Location',
      identifier: identifier ? [identifier] : [],
      status: 'suspended',
      mode: 'instance',
      name,
      address,
      type: locationType ? [locationType] : [],
      telecom: telecom,
      physicalType: {
        coding: [
          {
            system:
              'http://terminology.hl7.org/CodeSystem/location-physical-type',
            code: 'si',
            display: 'Site',
          },
        ],
        text: 'Site',
      },
      managingOrganization: { reference: newOrganizationId },
    };
    const newPractitionerRole: PractitionerRole = {
      resourceType: 'PractitionerRole',
      active: true,
      code: [
        {
          coding: [
            {
              system:
                'http://beetamin.hivevn.net/fhir/CodeSystem/practitioner-role',
              code: 'ORGANIZATION_DIRECTOR',
              display: 'Giám đốc cơ sở',
            },
          ],
          text: 'Giám đốc cơ sở',
        },
      ],
      practitioner: {
        reference: `Practitioner/${practitioner.id}`,
        display: practitioner.name?.[0]?.text,
      },
      organization: { reference: newOrganizationId, display: name },
      location: [{ reference: newLocationId, display: name }],
    };
    const requestBundle: Bundle<FhirResource> = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          fullUrl: newOrganizationId,
          resource: newOrganization,
          request: {
            method: 'POST',
            url: 'Organization',
          },
        },
        {
          fullUrl: newLocationId,
          resource: newLocation,
          request: {
            method: 'POST',
            url: 'Location',
          },
        },
        {
          fullUrl: newPractitionerRoleId,
          resource: newPractitionerRole,
          request: {
            method: 'POST',
            url: 'PractitionerRole',
          },
        },
      ],
    };
    try {
      return await this.fhirService.submitTransaction(requestBundle);
    } catch (error: any) {
      console.error('Error registering organization:', error);
      throw new InternalServerErrorException('Failed to register organization');
    }
  }

  async getOrganizationById(
    organizationId: string,
  ): Promise<Organization | null> {
    const organization = await this.fhirService.read<Organization>(
      'Organization',
      organizationId,
    );
    if (organization && organization.resourceType === 'Organization') {
      return organization;
    }
    return null;
  }

  async getOrganizationsByPractitionerId(
    practitionerId: string,
  ): Promise<PractitionerOrganizationDto[]> {
    const practitionerRoles = await this.fhirService.search<
      Bundle<PractitionerRole>
    >('PractitionerRole', {
      practitioner: practitionerId,
    });
    const organizations: PractitionerOrganizationDto[] = [];
    if (practitionerRoles.entry && practitionerRoles.entry.length > 0) {
      const practitionerRolesConverted = practitionerRoles.entry.map(
        (entry) => {
          const practitionerRole = entry.resource;
          if (
            practitionerRole &&
            practitionerRole.resourceType === 'PractitionerRole' &&
            practitionerRole.organization &&
            practitionerRole.organization.reference
          ) {
            const orgRef = practitionerRole.organization.reference;
            const orgId = orgRef.startsWith('Organization/')
              ? orgRef.split('/')[1]
              : orgRef;
            return {
              practitionerRoleId: practitionerRole.id,
              organizationId: orgId,
              isPractitionerRoleActive: practitionerRole.active || false,
              roles:
                practitionerRole.code?.map((code) => {
                  return {
                    coding: code.coding,
                    text: code.text,
                  };
                }) || [],
            };
          }
        },
      );
      for (const prced of practitionerRolesConverted) {
        if (!prced) continue;
        const organization = await this.getOrganizationById(
          prced.organizationId,
        );
        if (organization) {
          organizations.push({
            ...prced,
            isOrganizationActive: organization.active || false,
            organizationName: organization.name,
            organizationStatus: organization.extension?.map((ext) => {
              if (
                ext.url ===
                'http://beetamin.hivevn.net/fhir/StructureDefinition/organization-approval'
              ) {
                const statusExt = ext.extension?.find(
                  (e) => e.url === 'status',
                );
                return statusExt?.valueCode;
              }
            })[0],
            organizationType: organization.type,
            organizationAddress: organization.address?.[0],
            organizationTelecom: {
              ...this.fhirHelper.contactPointToString(organization.telecom),
            },
          });
        }
      }
    }
    return organizations;
  }
}
