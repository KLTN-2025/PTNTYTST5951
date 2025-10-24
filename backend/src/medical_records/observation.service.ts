import { Injectable } from '@nestjs/common';
import { Observation } from 'fhir/r5';

@Injectable()
export class ObservationService {
  addObservation(patientId: string, performer: string): Observation {
    return {} as Observation;
  }
}
