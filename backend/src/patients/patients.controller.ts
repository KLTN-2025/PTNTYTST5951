import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthUser, PatientUser } from 'src/commons/decorators/user.decorator';
import type { Bundle, FhirResource } from 'fhir/r4';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('auth')
  getPatientId(@AuthUser({ patient: true }) user: AuthUser) {
    if (!user.patientId) {
      throw new NotFoundException('Patient resource not found for the user', {
        description: 'PATIENT_RESOURCE_NOT_FOUND',
      });
    }
    return { patientId: user.patientId };
  }

  @Get('me')
  async getMyPatientResource(
    @PatientUser({ patient: true }) user: PatientUser,
  ): Promise<any> {
    const patientResource = await this.patientsService.findPatientById(
      user.patientId,
    );
    return patientResource;
  }

  @Get('beetamin-init-health-profile')
  async getBeetaminHealthProfile(
    @PatientUser({ patient: true }) user: PatientUser,
  ): Promise<any> {
    const healthProfile = await this.patientsService.getBeetaminHealthProfile(
      user.patientId,
    );
    return healthProfile;
  }

  @Post('beetamin-init-health-profile')
  async initBeetaminHealthProfile(
    @PatientUser({ patient: true }) user: PatientUser,
    @Body() profileData: Bundle<FhirResource>,
  ): Promise<any> {
    return await this.patientsService.initBeetaminHealthProfile(profileData);
  }
}
