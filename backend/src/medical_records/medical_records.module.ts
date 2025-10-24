import { Module } from '@nestjs/common';
import { ObservationService } from './observation.service';

@Module({
  providers: [ObservationService],
})
export class MedicalRecordsModule {}
