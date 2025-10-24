import { Body, Controller, Get, Post } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { User } from 'src/commons/decorators/user.decorator';
import { InitIdentitiesInfoDto } from 'src/identities/dtos/identities-info.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  getPatientInfo(keycloakId: string) {
    return {
      keycloakId,
    };
  }

  @Get('test-role')
  @Roles({ roles: ['realm:patient'] })
  testRole(@User() user: User): any {
    return {
      message: 'You have access to this route',
      user,
    };
  }

  @Post('init')
  createPatient(
    @User() user: User,
    @Body() patientInfo: InitIdentitiesInfoDto,
  ): any {
    return {
      user,
      patientInfo,
    };
  }
}
