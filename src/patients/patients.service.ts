import { Injectable } from '@nestjs/common';
import { IdentitiesService } from 'src/identities/identities.service';

@Injectable()
export class PatientsService {
  constructor(private identitiesService: IdentitiesService) {}

  getPatientInfo(keycloakId: string): string {
    return `Hello World! Your keycloak ID is ${keycloakId}`;
  }

  createPatient(): string {
    return 'Patient created!';
  }
}
