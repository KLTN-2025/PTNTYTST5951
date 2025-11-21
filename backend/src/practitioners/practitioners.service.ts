import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type {
  Bundle,
  BundleEntry,
  DocumentReference,
  FhirResource,
  Practitioner,
  PractitionerQualification,
} from 'fhir/r4';
import {
  BasicCodeSystem,
  FhirHelperService,
} from 'src/fhir/fhir-helper.service';
import { FhirService } from 'src/fhir/fhir.service';
import { PractitionerDto } from './dtos/pratitioner.dto';
import { UpdatePatientQualificationDto } from './dtos/qualification.dto';
import { v4 as uuidV4 } from 'uuid';
import { PractitionerQualificationDto } from './dtos/qualification.dto';
import { PractitionerUser } from 'src/commons/decorators/user.decorator';
import { RegisterOrganizationDto } from 'src/organizations/dtos/register-organization.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { PractitionerOrganizationDto } from 'src/organizations/dtos/practitioner-organization.dto';

@Injectable()
export class PractitionersService {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly fhirService: FhirService,
    private readonly fhirHelper: FhirHelperService,
  ) {}

  private async getFhirPractitionerResource(
    practitionerId: string,
  ): Promise<Practitioner> {
    try {
      const practitioner: Practitioner =
        await this.fhirService.read<Practitioner>(
          'Practitioner',
          practitionerId,
        );
      if (
        !practitioner ||
        practitioner.resourceType !== 'Practitioner' ||
        !practitioner.id
      ) {
        throw new NotFoundException('Resource not found');
      }
      return practitioner;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Resource not found');
      }
      throw new InternalServerErrorException('Failed to fetch practitioner');
    }
  }

  private async getDocumentReferenceResource(
    documentId: string,
  ): Promise<DocumentReference> {
    const documentReference: DocumentReference =
      await this.fhirService.read<DocumentReference>(
        'DocumentReference',
        documentId,
      );
    if (
      !documentReference ||
      documentReference.resourceType !== 'DocumentReference'
    ) {
      throw new NotFoundException('DocumentReference not found');
    }
    return documentReference;
  }

  async getPractitionerInfo(
    practitionerId: string,
    practitioner?: Practitioner,
  ): Promise<PractitionerDto> {
    if (!practitioner) {
      practitioner = await this.getFhirPractitionerResource(practitionerId);
    }
    const { phone, email } = this.fhirHelper.contactPointToString(
      practitioner.telecom,
    );
    const { citizenIdentification } = this.fhirHelper.identifierToString(
      practitioner.identifier!,
    );
    const practitionerDto: PractitionerDto = {
      id: practitioner.id,
      name: this.fhirHelper.humanNameToString(practitioner.name),
      phone: phone,
      email: email,
      citizenIdentification: citizenIdentification,
      gender: practitioner.gender as 'male' | 'female',
      birthDate: practitioner.birthDate,
      photo: practitioner.photo ? practitioner.photo[0].url || '' : undefined,
    };
    return practitionerDto;
  }
  private async getPractitionerQualification(
    practitionerQualification: PractitionerQualification,
  ): Promise<PractitionerQualificationDto[]> {
    const documents: PractitionerQualificationDto[] = [];
    for (const ext of practitionerQualification.extension || []) {
      if (
        ext.url ===
          'https://beetamin.hivevn.net/fhir/StructureDefinition/qualification-document' &&
        ext.valueReference?.reference
      ) {
        const documentId = ext.valueReference.reference.replace(
          'DocumentReference/',
          '',
        );
        const documentReference =
          await this.getDocumentReferenceResource(documentId);
        const selectedDocumentTypeCode =
          practitionerQualification.code.coding?.find(
            (item) =>
              item.system ===
              'http://beetamin.hivevn.net/fhir/CodeSystem/qualification-document-type',
          );
        const selectedDocumentSubTypeCode =
          practitionerQualification.code.coding?.find(
            (item) =>
              item.system &&
              item.system.startsWith(
                'https://beetamin.hivevn.net/fhir/CodeSystem/vn-',
              ),
          );
        documents.push({
          id: practitionerQualification.id,
          documentId: documentReference.id,
          status: documentReference.status,
          docStatus: documentReference.docStatus!,
          documentTypeCode: selectedDocumentTypeCode!,
          documentSubTypeCode: selectedDocumentSubTypeCode!,
          documentImages: documentReference.content?.map((content) => ({
            url: content.attachment?.url || '',
            contentType: content.attachment?.contentType || '',
          })),
          placeOfIssue: practitionerQualification.issuer?.display || '',
          issueDate: practitionerQualification.period?.start || '',
        });
      }
    }
    return documents;
  }

  async getPractitionerDocumentType(): Promise<BasicCodeSystem[]> {
    const documentTypeUrl =
      'http://beetamin.hivevn.net/fhir/CodeSystem/qualification-document-type';
    const documentTypes =
      await this.fhirHelper.findCodeSystemByUrl(documentTypeUrl);
    if (documentTypes.length === 0) {
      throw new NotFoundException('Qualification document types not found');
    }
    for (const docType of documentTypes) {
      if (!docType.code || !docType.display) {
        throw new NotFoundException(
          'Invalid Qualification document types data',
        );
      }
      const childUrl = `https://beetamin.hivevn.net/fhir/CodeSystem/vn-${docType.code}`;
      const childTypes = await this.fhirHelper.findCodeSystemByUrl(childUrl);
      if (childTypes.length > 0) {
        docType.children = childTypes;
      }
    }
    return documentTypes;
  }

  async updatePractitionerInfo(
    userId: string,
    practitionerId: string,
    updateData: PractitionerDto,
  ): Promise<PractitionerDto> {
    // Fetch the existing practitioner resource
    const practitioner: Practitioner =
      await this.getFhirPractitionerResource(practitionerId);

    if (updateData.name) {
      practitioner.name = this.fhirHelper.humanNameConverter(updateData.name);
    }
    practitioner.telecom = this.fhirHelper.contactPointConverter({
      phone: updateData.phone,
      email: updateData.email,
    });
    if (updateData.citizenIdentification) {
      practitioner.identifier = this.fhirHelper.identifierConverter({
        citizenIdentification: updateData.citizenIdentification,
        userId,
      });
    }
    if (updateData.gender) {
      practitioner.gender = updateData.gender;
    }
    if (updateData.birthDate) {
      practitioner.birthDate = updateData.birthDate;
    }

    // Save the updated practitioner resource
    await this.fhirService.update('Practitioner', practitionerId, practitioner);

    return this.getPractitionerInfo(practitionerId, practitioner);
  }

  async updatePractitionerQualification({
    practitionerId,
    type,
    data,
  }: {
    practitionerId: string;
    type: 'UPDATE' | 'ADD';
    data: UpdatePatientQualificationDto;
  }) {
    const practitioner: Practitioner =
      await this.fhirService.read<Practitioner>('Practitioner', practitionerId);
    if (
      !practitioner ||
      practitioner.resourceType !== 'Practitioner' ||
      !practitioner.id
    ) {
      throw new BadRequestException('Practitioner not found');
    }
    const documentId =
      type === 'ADD' ? `urn:uuid:${uuidV4()}` : data.documentId;
    if (!documentId) {
      throw new BadRequestException('documentId is required');
    }
    if (type === 'UPDATE' && !data.qualificationId) {
      throw new BadRequestException('qualificationId is required for update');
    }
    const qualificationEntry: PractitionerQualification = {
      code: data.qualificationType,
      issuer: { display: data.issuer },
      period: {
        start: data.periodStart,
        end: data.periodEnd,
      },
      extension: [
        {
          url: 'https://beetamin.hivevn.net/fhir/StructureDefinition/qualification-document',
          valueReference: {
            reference:
              type === 'ADD'
                ? documentId
                : `DocumentReference/${data.documentId}`,
          },
        },
      ],
    };
    if (type === 'ADD') {
      if (!practitioner.qualification) {
        practitioner.qualification = [];
      }
      practitioner.qualification.push(qualificationEntry);
      qualificationEntry.id = uuidV4();
    } else if (type === 'UPDATE') {
      const qualificationIndex = practitioner.qualification?.findIndex(
        (qual) => qual.id === data.qualificationId,
      );
      if (
        qualificationIndex === undefined ||
        qualificationIndex < 0 ||
        !practitioner.qualification
      ) {
        throw new BadRequestException(
          'Qualification to update not found on practitioner',
        );
      }
      practitioner.qualification[qualificationIndex] = {
        ...practitioner.qualification[qualificationIndex],
        ...qualificationEntry,
      };
    }
    const documentContents = data.documentAttachments.map((attachment) => ({
      attachment: attachment,
    }));
    if (documentContents.length === 0) {
      throw new BadRequestException(
        'At least one document attachment is required',
      );
    }
    const documentReference: DocumentReference =
      type === 'UPDATE'
        ? await this.fhirService.read<DocumentReference>(
            'DocumentReference',
            documentId,
          )
        : {
            resourceType: 'DocumentReference',
            status: 'current',
            category: [
              {
                coding: [
                  {
                    system:
                      'https://beetamin.hivevn.net/fhir/CodeSystem/document-category',
                    code: 'qualification',
                    display: 'Qualification document',
                  },
                ],
              },
            ],
            content: [],
            docStatus: 'preliminary',
          };
    if (documentReference.resourceType !== 'DocumentReference') {
      throw new BadRequestException('DocumentReference not found');
    }
    documentReference.description = `Qualification document for ${data.qualificationType.text}`;
    documentReference.type = data.qualificationType;
    documentReference.content = documentContents;
    if (type === 'ADD') {
      documentReference.subject = {
        reference: `Practitioner/${practitionerId}`,
      };
    }
    const documentReferenceBundleEntry: BundleEntry<FhirResource> = {
      resource: documentReference,
      request: {
        method: type === 'ADD' ? 'POST' : 'PUT',
        url:
          type === 'ADD'
            ? 'DocumentReference'
            : `DocumentReference/${documentId}`,
      },
    };
    if (type === 'ADD') {
      documentReferenceBundleEntry.fullUrl = documentId;
    }
    const transactionBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: practitioner,
          request: {
            method: 'PUT',
            url: `Practitioner/${practitionerId}`,
          },
        },
        { ...documentReferenceBundleEntry },
      ],
    };
    try {
      console.log('Transaction Bundle:', JSON.stringify(transactionBundle));

      await this.fhirService.post('', transactionBundle);
    } catch (error) {
      console.error('Error updating practitioner qualification:', error);
      throw new BadRequestException(
        'Failed to update practitioner qualification',
      );
    }
  }

  async getPractitionerQualifications(
    user: PractitionerUser,
  ): Promise<PractitionerQualificationDto[]> {
    const practitioner = await this.getFhirPractitionerResource(
      user.practitionerId,
    );
    const qualifications = practitioner.qualification;
    if (qualifications && qualifications.length > 0) {
      const allDocuments: PractitionerQualificationDto[] = [];
      for (const qualification of qualifications) {
        const documents =
          await this.getPractitionerQualification(qualification);
        allDocuments.push(...documents);
      }
      return allDocuments;
    }
    return [];
  }

  async deletePractitionerQualification(
    practitionerId: string,
    qualificationId: string,
  ) {
    const practitioner: Practitioner =
      await this.getFhirPractitionerResource(practitionerId);
    const qualificationIndex = practitioner.qualification?.findIndex(
      (qual) => qual.id === qualificationId,
    );
    if (
      qualificationIndex === undefined ||
      qualificationIndex < 0 ||
      !practitioner.qualification
    ) {
      throw new NotFoundException(
        'Qualification to delete not found on practitioner',
      );
    }
    const qualificationToDelete =
      practitioner.qualification[qualificationIndex];
    let documentReferenceId: string | undefined;
    for (const ext of qualificationToDelete.extension || []) {
      if (
        ext.url ===
          'https://beetamin.hivevn.net/fhir/StructureDefinition/qualification-document' &&
        ext.valueReference?.reference
      ) {
        documentReferenceId = ext.valueReference.reference.replace(
          'DocumentReference/',
          '',
        );
      }
    }
    practitioner.qualification.splice(qualificationIndex, 1);
    const transactionBundle: Bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: practitioner,
          request: {
            method: 'PUT',
            url: `Practitioner/${practitionerId}`,
          },
        },
      ],
    };
    if (documentReferenceId) {
      transactionBundle.entry!.push({
        request: {
          method: 'DELETE',
          url: `DocumentReference/${documentReferenceId}`,
        },
      });
    }
    try {
      await this.fhirService.post('', transactionBundle);
    } catch (error) {
      console.error('Error deleting practitioner qualification:', error);
      throw new BadRequestException(
        'Failed to delete practitioner qualification',
      );
    }
  }

  async registerOrganization(
    practitionerId: string,
    body: RegisterOrganizationDto,
  ) {
    const practitioner: Practitioner =
      await this.getFhirPractitionerResource(practitionerId);

    const newOrganization = this.organizationsService.registerOrganization({
      practitioner,
      organizationData: body,
    });
    return newOrganization;
  }

  async getMyOrganizations(
    practitionerId: string,
  ): Promise<PractitionerOrganizationDto[]> {
    return await this.organizationsService.getOrganizationsByPractitionerId(
      practitionerId,
    );
  }
}
