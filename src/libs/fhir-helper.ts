import type {
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Coding,
} from 'fhir/r4';

type Primitive = string | number | boolean | null | undefined;

// Nếu bạn chỉ cần display của Coding
function extractAnswerValue(
  answer: QuestionnaireResponseItemAnswer
): Primitive {
  return (
    answer.valueBoolean ??
    answer.valueString ??
    answer.valueInteger ??
    answer.valueDecimal ??
    answer.valueDate ??
    answer.valueDateTime ??
    answer.valueTime ??
    answer.valueCoding?.code ??
    null
  );
}

export type LinkIdValuePair = {
  linkId: string;
  value: Primitive;
};

export function flattenQuestionnaireResponse(
  qr: QuestionnaireResponse
): LinkIdValuePair[] {
  const result: LinkIdValuePair[] = [];

  const walk = (items?: QuestionnaireResponseItem[]) => {
    if (!items) return;

    for (const item of items) {
      if (item.answer) {
        for (const ans of item.answer) {
          result.push({
            linkId: item.linkId,
            value: extractAnswerValue(ans),
          });

          if (ans.item) {
            walk(ans.item);
          }
        }
      }

      if (item.item) {
        walk(item.item);
      }
    }
  };

  walk(qr.item);
  return result;
}
