import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import type { Attachment, CodeableConcept, Coding } from 'fhir/r4';

export class PractitionerQualificationTypeDto {
  system: string;
  code: string;
  display: string;
  children?: PractitionerQualificationTypeDto[];
}

export class PractitionerQualificationDto {
  id?: string;
  documentId?: string;
  status?: string;
  docStatus: string;
  documentTypeCode: Coding;
  documentSubTypeCode: Coding;
  placeOfIssue: string;
  issueDate: string;
  documentImages: { url: string; contentType: string }[];
}

export class UpdatePatientQualificationDto {
  documentId?: string;
  qualificationId?: string;

  @IsNotEmpty()
  qualificationType: CodeableConcept;

  @IsNotEmpty()
  issuer: string;

  @IsNotEmpty()
  @IsDateString()
  periodStart: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsNotEmpty()
  documentAttachments: Attachment[];
}
