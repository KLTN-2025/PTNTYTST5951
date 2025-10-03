import { BadRequestException, Injectable } from '@nestjs/common';
import { FhirService } from 'src/fhir/fhir.service';
import { InitIdentitiesInfoDto } from './dtos/identities-info.dto';
import { Patient, Bundle, Practitioner } from 'fhir/r5';
import { User } from '../commons/decorators/user.decorator';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { KeycloakAdminService } from 'src/auth/keycloak-admin.service';
import { UserRole } from 'src/commons/enums/role.enum';

@Injectable()
export class IdentitiesService {
  constructor(
    private fhirService: FhirService,
    private fhirHelperService: FhirHelperService,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  async createNewUser(
    userData: User,
    initIdentitiesInfoData: InitIdentitiesInfoDto,
    identityType: UserRole,
  ): Promise<Patient | Practitioner> {
    const identifierData = this.fhirHelperService.identifierConverter(
      initIdentitiesInfoData,
    );
    if (identifierData.length === 0) {
      throw new BadRequestException(
        'Người dùng phải có ít nhất một định danh hợp lệ',
      );
    }
    const telecomData = this.fhirHelperService.contactPointConverter(
      initIdentitiesInfoData,
    );
    if (telecomData.length === 0) {
      throw new BadRequestException(
        'Người dùng phải có ít nhất một thông tin liên hệ hợp lệ',
      );
    }
    const patientData: Patient | Practitioner = {
      resourceType:
        identityType === UserRole.PATIENT ? 'Patient' : 'Practitioner',
      identifier: identifierData,
      name: [
        this.fhirHelperService.humanNameConverter(initIdentitiesInfoData.name),
      ],
      telecom: this.fhirHelperService.contactPointConverter(
        initIdentitiesInfoData,
      ),
      gender: initIdentitiesInfoData.gender,
      birthDate: initIdentitiesInfoData.birthdate,
    };
    const ifNoneExistIdentifier = identifierData
      .map((id) => `identifier=${id.system}|${id.value}`)
      .join('&');

    const ifNoneExistTelecom = telecomData
      .map((contact) => `telecom=${contact.system}|${contact.value}`)
      .join('&');

    const ifNoneExistCombined = [ifNoneExistIdentifier, ifNoneExistTelecom]
      .filter(Boolean)
      .join('&');

    const newPatientData: Patient | Practitioner = await this.fhirService.post<
      Patient | Practitioner
    >(`/${identityType}`, patientData, {
      headers: {
        'If-None-Exist': ifNoneExistCombined,
      },
    });
    if (!newPatientData.id) {
      throw new BadRequestException(`Tạo ${identityType} không thành công`);
    }
    await this.keycloakAdminService.assignUser(
      userData.beetaminId,
      newPatientData.id,
      identityType,
    );
    return newPatientData;
  }

  async getPatientInfoByIdentifier(identifierType: string, value: string) {
    const searchResult = await this.fhirService.get<Bundle<Patient>>(
      `/Patient?identifier=${identifierType}|${value}`,
    );
    if (searchResult.entry && (searchResult.total ?? 0) > 0) {
      if (searchResult.total && searchResult.total > 1) {
        console.warn(
          `Warning: Found ${searchResult.total} patients with the same ${identifierType}: ${value}. Returning the first one.`,
        );
      }
      return searchResult.entry[0].resource;
    }
    return null;
  }
}
