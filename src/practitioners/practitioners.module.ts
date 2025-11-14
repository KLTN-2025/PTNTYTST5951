import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { FhirModule } from 'src/fhir/fhir.module';

@Module({
  imports: [FhirModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
})
export class PractitionersModule {}
