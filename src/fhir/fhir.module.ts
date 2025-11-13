import { Module } from '@nestjs/common';
import { FhirService } from './fhir.service';
import { FhirHelperService } from './fhir-helper.service';

@Module({
  imports: [],
  providers: [FhirService, FhirHelperService],
  exports: [FhirService, FhirHelperService],
})
export class FhirModule {}
