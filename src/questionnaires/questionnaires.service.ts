import {
  populateQuestionnaire,
  PopulateResult,
  PopulateQuestionnaireParams,
  FetchResourceRequestConfig,
} from '@aehrc/sdc-populate';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { Questionnaire, Bundle, Patient, FhirResource } from 'fhir/r4';
import { FhirService } from 'src/fhir/fhir.service';

@Injectable()
export class QuestionnairesService {
  constructor(private readonly fhirService: FhirService) {}

  private async fetchFromFhir(
    query: string,
    requestConfig: FetchResourceRequestConfig,
  ): Promise<any> {
    const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    let { sourceServerUrl } = requestConfig;

    const headers: Record<string, string> = {
      Accept: 'application/fhir+json;charset=utf-8',
    };

    if (!sourceServerUrl.endsWith('/')) {
      sourceServerUrl += '/';
    }

    const requestUrl = ABSOLUTE_URL_REGEX.test(query)
      ? query
      : `${sourceServerUrl}${query}`;

    const res = await fetch(requestUrl, { headers });

    if (!res.ok) {
      throw new Error(
        `HTTP error when performing ${requestUrl}. Status: ${res.status}`,
      );
    }
    return res.json();
  }

  private async populate(questionnaire: Questionnaire, patient: Patient) {
    const params: PopulateQuestionnaireParams = {
      questionnaire,
      patient,
      fetchResourceCallback: (query, requestConfig) =>
        this.fetchFromFhir(query, requestConfig),
      fetchResourceRequestConfig: {
        sourceServerUrl:
          process.env.HAPI_FHIR_URL || 'http://localhost:8080/fhir',
      },
    };

    const { populateResult, populateSuccess } =
      await populateQuestionnaire(params);

    if (!populateSuccess || !populateResult) {
      throw new Error('Populate thất bại');
    }
    return populateResult.populatedResponse;
  }

  async populateQuestionnaireByUrl(
    questionnaireUrl: string,
    patient: Patient,
  ): Promise<PopulateResult & { questionnaire: Questionnaire }> {
    const questionnaireBundle = await this.fhirService.search<
      Bundle<Questionnaire>
    >('Questionnaire', { url: questionnaireUrl });
    if (
      questionnaireBundle.total === 0 ||
      !questionnaireBundle.entry ||
      !questionnaireBundle.entry[0].resource
    ) {
      throw new NotFoundException(
        `Questionnaire not found for URL: ${questionnaireUrl}`,
        {
          description: `QUESTIONNAIRE_RESOURCE_NOT_FOUND`,
        },
      );
    }
    const questionnaire: Questionnaire = questionnaireBundle.entry[0].resource;

    const populatedResponse = await this.populate(questionnaire, patient);

    return {
      populatedResponse,
      questionnaire,
    };
  }

  async extractQuestionnaireResponseAnswers(
    bundle: Bundle<FhirResource>,
  ): Promise<any> {
    return await this.fhirService.post('', bundle);
  }
}
