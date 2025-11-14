import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FhirResource, Patient, Questionnaire } from 'fhir/r4';
import { Bundle } from 'fhir/r4';
import { FhirService } from 'src/fhir/fhir.service';
import { PatientDto } from './dtos/patient.dto';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { QuestionnairesService } from 'src/questionnaires/questionnaires.service';
import { PopulateResult } from '@aehrc/sdc-populate';

@Injectable()
export class PatientsService {
  constructor(
    private fhirHelperService: FhirHelperService,
    private fhirService: FhirService,
    private questionnairesService: QuestionnairesService,
  ) {}

  private async findFhirPatientInfoByHiveId(
    hiveId: string,
  ): Promise<Patient | null> {
    const patient = await this.fhirService.get<Bundle<Patient>>(
      `Patient?identifier=https://id.hivevn.net/identifier|${hiveId}`,
    );
    if (patient.total === 0 || !patient.entry) return null;
    if (!patient.entry[0].resource) return null;
    return patient.entry[0].resource;
  }

  private async findFhirPatientById(
    patientId: string,
  ): Promise<Patient | null> {
    try {
      const data = await this.fhirService.read<Patient>('Patient', patientId);
      if (data.resourceType === 'Patient') {
        return data;
      }
      return null;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw new InternalServerErrorException('FHIR server is unavailable');
    }
  }

  async findPatientById(patientId: string): Promise<PatientDto> {
    const patient = await this.findFhirPatientById(patientId);
    if (!patient) {
      throw new NotFoundException(
        `Not found Patient resource with ID ${patientId}`,
        {
          cause: 'PATIENT_RESOURCE_NOT_FOUND',
          description: 'PATIENT_RESOURCE_NOT_FOUND',
        },
      );
    }
    const patientName = this.fhirHelperService.humanNameToString(patient.name);
    const { email, phone } = this.fhirHelperService.contactPointToString(
      patient.telecom,
    );
    return {
      id: patient.id,
      name: patientName,
      gender: patient.gender as 'male' | 'female',
      birthDate: patient.birthDate,
      email,
      phone,
    };
  }

  async getBeetaminHealthProfile(
    patientId: string,
  ): Promise<PopulateResult & { questionnaire: Questionnaire }> {
    const patient = await this.findFhirPatientById(patientId);
    if (!patient) {
      throw new NotFoundException(
        `Not found Patient resource with ID ${patientId}`,
        {
          cause: 'PATIENT_RESOURCE_NOT_FOUND',
          description: 'PATIENT_RESOURCE_NOT_FOUND',
        },
      );
    }
    return await this.questionnairesService.populateQuestionnaireByUrl(
      'http://beetamin.hivevn.net/fhir/Questionnaire/init-health-profile-sdc',
      patient,
    );
  }

  async initBeetaminHealthProfile(
    profileData: Bundle<FhirResource>,
  ): Promise<any> {
    return await this.questionnairesService.extractQuestionnaireResponseAnswers(
      profileData,
    );
  }
}
