import { Body, Controller, Post } from '@nestjs/common';
import { QuestionnairesService } from './questionnaires.service';
import { Public } from 'nest-keycloak-connect';
import type { Patient } from 'fhir/r4';

@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly questionnairesService: QuestionnairesService) {}

  @Public()
  @Post('populate')
  async populateQuestionnaire(
    @Body('url') url: string,
    @Body('patient') patient: Patient,
  ) {
    return await this.questionnairesService.populateQuestionnaireByUrl(
      url,
      patient,
    );
  }
}
