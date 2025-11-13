import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { IdentitiesModule } from 'src/identities/identities.module';
import { FhirModule } from 'src/fhir/fhir.module';
import { QuestionnairesModule } from 'src/questionnaires/questionnaires.module';

@Module({
  imports: [IdentitiesModule, FhirModule, QuestionnairesModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
