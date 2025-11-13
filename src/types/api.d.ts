import { Questionnaire } from 'fhir/r4';

export interface PatientInfo {
  id: string;
  email: string;
  phone: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
}

export type BeetaminInitHealthProfile = {
  questionnaire: Questionnaire;
  populatedContext: Record<string, any>;
  populatedResponse: QuestionnaireResponse;
};
