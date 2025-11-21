import { IsNotEmpty, IsString } from 'class-validator';
import type {
  Address,
  CodeableConcept,
  ContactPoint,
  Identifier,
} from 'fhir/r4';
export class RegisterOrganizationDto {
  @IsNotEmpty()
  identifier?: Identifier;

  @IsNotEmpty()
  type: CodeableConcept;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  telecom: ContactPoint[];

  @IsNotEmpty()
  address: Address;
}
