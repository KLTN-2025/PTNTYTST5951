import { Module } from '@nestjs/common';
import { ObservationsService } from './observations.service';
@Module({
  providers: [ObservationsService],
})
export class ObservationsModule {}
