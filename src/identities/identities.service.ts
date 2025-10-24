import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { FhirService } from 'src/fhir/fhir.service';
import { InitIdentitiesInfoDto } from './dtos/identities-info.dto';
import { Patient, Bundle, Practitioner } from 'fhir/r5';
import { User } from '../commons/decorators/user.decorator';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { KeycloakAdminService } from 'src/auth/keycloak-admin.service';
import { UserRole } from 'src/commons/enums/role.enum';

type UniqueFieldKey = 'userId' | 'citizenIdentification' | 'phone' | 'email';

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
    const resourceType =
      identityType === UserRole.PATIENT ? 'Patient' : 'Practitioner';
    const identifierData = this.fhirHelperService.identifierConverter({
      ...initIdentitiesInfoData,
      userId: userData.id,
    });
    if (identifierData.length === 0) {
      throw new BadRequestException(
        'Người dùng phải có ít nhất một định danh hợp lệ',
      );
    }
    const exitedUser = await this.isUserUniqueField({
      ...initIdentitiesInfoData,
      role: identityType,
      userId: userData.id,
    });
    console.log('exitedUser', exitedUser);
    if (exitedUser) {
      throw new ConflictException('Dữ liệu trùng lặp', {
        description: JSON.stringify(exitedUser),
      });
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
      resourceType: resourceType,

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
    >(`/${resourceType}`, patientData, {
      headers: {
        'If-None-Exist': ifNoneExistCombined,
      },
    });
    if (!newPatientData.id) {
      throw new BadRequestException(`Tạo ${identityType} không thành công`);
    }
    await this.keycloakAdminService.assignUser(
      userData.id,
      newPatientData.id,
      identityType,
    );
    return newPatientData;
  }

  async isUserUniqueField({
    userId,
    citizenIdentification,
    phone,
    email,
    role,
  }: {
    userId?: string;
    citizenIdentification?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
  }): Promise<Record<UniqueFieldKey, boolean> | null> {
    const resourceTypeByRole: Partial<
      Record<UserRole, 'Patient' | 'Practitioner'>
    > = {
      [UserRole.PATIENT]: 'Patient',
      [UserRole.PRACTITIONER]: 'Practitioner',
    };
    console.log('userId', userId);

    const resourceType = resourceTypeByRole[role!];
    if (!resourceType) throw new BadRequestException('Role không hợp lệ');

    const queryBuilders: Record<UniqueFieldKey, (v: string) => string> = {
      userId: (v) =>
        `identifier=https://beetamin.hivevn.net/fhir/sid/beetamin-id|${encodeURIComponent(v)}`,
      citizenIdentification: (v) =>
        `identifier=https://beetamin.hivevn.net/fhir/sid/vn-national-id|${encodeURIComponent(v)}`,
      phone: (v) => `telecom=phone|${encodeURIComponent(v)}`,
      email: (v) => `telecom=email|${encodeURIComponent(v)}`,
    };

    const inputs: Partial<Record<UniqueFieldKey, string | undefined>> = {
      userId,
      citizenIdentification,
      phone,
      email,
    };

    const tasks = (
      Object.entries(inputs) as [UniqueFieldKey, string | undefined][]
    )
      .filter(([, val]) => typeof val === 'string' && val.trim().length > 0)
      .map(async ([key, raw]) => {
        const value = raw!.trim();
        const url = `/${resourceType}?${queryBuilders[key](value)}`;
        const bundle: Bundle | undefined =
          await this.fhirService.get<Bundle>(url);
        const found =
          (bundle?.total ?? 0) > 0 && (bundle?.entry?.length ?? 0) > 0;
        return { key, found };
      });

    if (tasks.length === 0) return null;

    const results = await Promise.all(tasks);
    const duplicates: Partial<Record<UniqueFieldKey, boolean>> = {};
    for (const r of results) {
      if (r.found) duplicates[r.key] = true;
    }

    return Object.keys(duplicates).length > 0
      ? (duplicates as Record<UniqueFieldKey, boolean>)
      : null;
  }
}
