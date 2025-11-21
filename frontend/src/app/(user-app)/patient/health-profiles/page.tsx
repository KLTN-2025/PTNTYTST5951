'use client';
import type { QuestionnaireResponse } from 'fhir/r4';
import { SmartFormRenderer } from '@/components/form/smart-form-renderer';
import {
  useBeetaminInitHealthProfile,
  useSaveBeetaminInitHealthProfile,
} from '@/hooks/health-profile';
import { toast } from 'sonner';
import InitHealthProfileViewer from '@/components/custom_ui/init-health-profile-viewer';
import {
  extractResultIsOperationOutcome,
  inAppExtract,
} from '@aehrc/sdc-template-extract';
import React, { useEffect, useState } from 'react';

export default function PatientHealthCheckPage() {
  const { isFetching, data, isError, error, isSuccess } =
    useBeetaminInitHealthProfile();
  const {
    mutate,
    isError: isSaveError,
    isSuccess: isSaveSuccess,
  } = useSaveBeetaminInitHealthProfile();
  const [initHealthProfileViewerData, setInitHealthProfileViewerData] =
    useState<QuestionnaireResponse>(data?.populatedResponse || {});
  useEffect(() => {
    if (isSaveError) {
      toast.error('Error to save questionnaire response.');
    }
    if (isSaveSuccess) {
      toast.success('Questionnaire response saved successfully.');
    }
  }, [isSaveError, isSaveSuccess]);
  useEffect(() => {
    if (data?.populatedResponse) {
      setInitHealthProfileViewerData(data.populatedResponse);
    }
  }, [data]);
  if (isFetching) {
    return <div>Loading...</div>;
  }
  if (isError) {
    if (error.statusCode === 0) {
      toast.error('Network error or server not reachable.');
      return <div>Network error or server not reachable.</div>;
    }
    toast.error('Error to load questionnaire: ' + error.message);

    return <div>Error to load questionnaire: {error.message}</div>;
  }

  if (isSuccess && data) {
    const handleSubmit = (qr: QuestionnaireResponse) => {
      console.log(qr);
      inAppExtract(qr, data.questionnaire, null).then((inAppExtractOutput) => {
        const extractResult = inAppExtractOutput.extractResult;
        if (extractResultIsOperationOutcome(extractResult)) {
          console.log(extractResult);
        } else {
          console.log(extractResult.extractedBundle);
          mutate(extractResult.extractedBundle);
        }
      });
      setInitHealthProfileViewerData(qr);
    };
    return (
      <div className="flex flex-row gap-5 bg-white p-4 shadow-2xl rounded-lg">
        <div>
          <InitHealthProfileViewer
            questionnaireResponse={initHealthProfileViewerData}
          />
        </div>
        <div className="flex-1">
          <SmartFormRenderer
            questionnaire={data.questionnaire}
            populatedResponse={data.populatedResponse}
            populatedContext={data.populatedContext}
            onSubmit={handleSubmit}
            readOnly={false}
          />
        </div>
      </div>
    );
  }
}
