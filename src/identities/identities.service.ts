import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { FhirService } from 'src/fhir/fhir.service';
import { InitIdentitiesInfoDto } from './dtos/identities-info.dto';
import { Patient, Bundle, Practitioner } from 'fhir/r4';
import { AuthUser } from '../commons/decorators/user.decorator';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { UserRole } from 'src/commons/enums/role.enum';
import { KeycloakAdminService } from 'src/auth/keycloak-admin.service';

type UniqueFieldKey = 'userId' | 'citizenIdentification' | 'phone' | 'email';
type ConflictField = { field: string; message: string };
@Injectable()
export class IdentitiesService {
  constructor(
    private fhirService: FhirService,
    private fhirHelperService: FhirHelperService,
    private readonly keycloakAdminService: KeycloakAdminService,
  ) {}

  async createNewUser(
    inputUserData: AuthUser,
    initIdentitiesInfoData: InitIdentitiesInfoDto,
    identityType: UserRole,
  ): Promise<Patient | Practitioner> {
    const resourceType =
      identityType === UserRole.PATIENT ? 'Patient' : 'Practitioner';
    //? Check unique fields
    const exitedUser = await this.isUserUniqueField({
      ...initIdentitiesInfoData,
      role: identityType,
      userId: inputUserData.userId,
    });
    if (exitedUser.length > 0) {
      throw new HttpException(
        {
          message: 'Your input has conflict fields',
          error: exitedUser,
          statusCode: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    }
    const identifierData = this.fhirHelperService.identifierConverter({
      ...initIdentitiesInfoData,
      userId: inputUserData.userId,
    });
    const telecomData = this.fhirHelperService.contactPointConverter(
      initIdentitiesInfoData,
    );
    const newBeetaminUserDataInput: Patient | Practitioner = {
      resourceType: resourceType,

      identifier: identifierData,
      name: [
        this.fhirHelperService.humanNameConverter(initIdentitiesInfoData.name),
      ],
      telecom: telecomData,
      gender: initIdentitiesInfoData.gender,
      birthDate: initIdentitiesInfoData.birthdate,
    };

    const newBeetaminUserData: Patient | Practitioner =
      await this.fhirService.post<Patient | Practitioner>(
        `/${resourceType}`,
        newBeetaminUserDataInput,
      );
    if (!newBeetaminUserData.id) {
      throw new BadRequestException(`Tạo ${identityType} không thành công`);
    }
    // Gán role tương ứng trong Keycloak
    try {
      const groupName = `Beetamin ${identityType}`;
      await this.keycloakAdminService.assignUserToGroup(
        inputUserData.userId,
        groupName,
      );
      await this.keycloakAdminService.setBeetaminIdForUser(
        inputUserData.userId,
        newBeetaminUserData.id,
        resourceType,
      );
    } catch (error) {
      await this.fhirService.delete(
        `/${resourceType}/${newBeetaminUserData.id}`,
      );
      console.error(error);
      throw new Error(`Gán role và gán beetamin-id không thành công: ${error}`);
    }
    return newBeetaminUserData;
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
  }): Promise<ConflictField[]> {
    const resourceTypeByRole: Partial<
      Record<UserRole, 'Patient' | 'Practitioner'>
    > = {
      [UserRole.PATIENT]: 'Patient',
      [UserRole.PRACTITIONER]: 'Practitioner',
    };

    const resourceType = resourceTypeByRole[role!];
    if (!resourceType) throw new BadRequestException('Phân quyền không hợp lệ');

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

    if (tasks.length === 0) return [];

    const results = await Promise.all(tasks);
    const duplicates: ConflictField[] = results.reduce((acc, curr) => {
      if (curr.found) {
        acc.push({
          field: curr.key,
          message: `${curr.key} is already in use`,
        });
      }
      return acc;
    }, [] as ConflictField[]);
    return duplicates;
  }
}
