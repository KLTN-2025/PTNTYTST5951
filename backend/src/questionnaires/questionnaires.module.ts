import { Module } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { FhirModule } from 'src/fhir/fhir.module';
import { QuestionnairesController } from './questionnaires.controller';

@Module({
  imports: [FhirModule],
  providers: [QuestionnairesService],
  exports: [QuestionnairesService],
  controllers: [QuestionnairesController],
})
export class QuestionnairesModule {}
