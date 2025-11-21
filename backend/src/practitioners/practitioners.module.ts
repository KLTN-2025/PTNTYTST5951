import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { FhirModule } from 'src/fhir/fhir.module';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [FhirModule, OrganizationsModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
})
export class PractitionersModule {}
