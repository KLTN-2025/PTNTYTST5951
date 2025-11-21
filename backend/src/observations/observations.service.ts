import { Injectable } from '@nestjs/common';

@Injectable()
export class ObservationsService {
  constructor() {}

  async registerNewObservation({
    practitionerId,
    observationData,
  }: {
    practitionerId: string;
    observationData: any;
  }): Promise<any> {}
}
