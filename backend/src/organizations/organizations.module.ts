import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { FhirModule } from 'src/fhir/fhir.module';

@Module({
  imports: [FhirModule],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
