'use client';

import React, { useEffect, useState } from 'react';
import {
  BaseRenderer,
  RendererThemeProvider,
  useBuildForm,
  useRendererQueryClient,
  getResponse,
  removeEmptyAnswersFromResponse,
  removeInternalIdsFromResponse,
  useQuestionnaireResponseStore,
  destroyForm,
  buildForm,
} from '@aehrc/smart-forms-renderer';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { toast } from 'sonner';

export interface SmartFormRendererProps {
  questionnaire: Questionnaire;
  populatedResponse?: QuestionnaireResponse;
  populatedContext?: Record<string, unknown>;
  readOnly?: boolean;
  onSubmit?: (qr: QuestionnaireResponse) => void;
}
export const SmartFormRenderer: React.FC<SmartFormRendererProps> = ({
  questionnaire,
  populatedResponse,
  populatedContext,
  readOnly,
  onSubmit,
}) => {
  const [isPopulating, setIsPopulating] = useState(false);
  const highlightRequiredItems =
    useQuestionnaireResponseStore.use.highlightRequiredItems();
  const validateResponse = useQuestionnaireResponseStore.use.validateResponse();

  const isBuilding = useBuildForm({ questionnaire });
  const queryClient = useRendererQueryClient();

  useEffect(() => {
    if (!populatedResponse && !populatedContext) return;

    let cancelled = false;

    (async () => {
      setIsPopulating(true);

      await buildForm({
        questionnaire,
        questionnaireResponse: populatedResponse,
        additionalContext: populatedContext,
        readOnly,
      });

      if (!cancelled) {
        setIsPopulating(false);
      }
    })();
    return () => {
      cancelled = true;
      destroyForm();
    };
  }, [questionnaire, populatedResponse, populatedContext]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;
    const raw = getResponse();
    const cleaned = removeInternalIdsFromResponse(
      questionnaire,
      removeEmptyAnswersFromResponse(questionnaire, raw)
    );
    validateResponse(questionnaire, cleaned);
    const { responseIsValid } = useQuestionnaireResponseStore.getState();
    if (!responseIsValid) {
      highlightRequiredItems();
      toast.error('Form is invalid. Please check the highlighted fields.');
      return;
    }
    onSubmit(cleaned);
  };

  if (isBuilding || isPopulating) {
    return (
      <div>{isBuilding ? 'Building form...' : 'Pre-populating form...'}</div>
    );
  }

  return (
    <RendererThemeProvider>
      <QueryClientProvider client={queryClient}>
        <form onSubmit={onSubmit ? handleSubmit : undefined}>
          <BaseRenderer />
          {onSubmit && !readOnly && (
            <button type="submit" className="mt-4">
              Lưu
            </button>
          )}
        </form>
      </QueryClientProvider>
    </RendererThemeProvider>
  );
};
