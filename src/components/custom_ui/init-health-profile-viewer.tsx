import { flattenQuestionnaireResponse } from '@/libs/fhir-helper';
import { QuestionnaireResponse } from 'fhir/r4';
import Image from 'next/image';
import React, { useCallback, useEffect } from 'react';

export type InitHealthProfileViewerDisplay = {
  bmi: {
    level: number;
    point: number;
  };
  smokingStatusDisplay: string;
  alcoholUseFrequencyDisplay: string;
  vaccinatedGuidelinesDisplay: string;
};

const bmiLevels = [
  'Unknown',
  'Servere Thinness',
  'Moderate Thinness',
  'Mild Thinness',
  'Normal',
  'Overweight',
  'Obese Class I',
  'Obese Class II',
  'Obese Class III',
];

const InitHealthProfileViewer = ({
  questionnaireResponse,
}: {
  questionnaireResponse: QuestionnaireResponse;
}) => {
  if (!questionnaireResponse) {
    return <div>No data available</div>;
  }
  const [initHealthProfileViewerDisplay, setInitHealthProfileViewerDisplay] =
    React.useState<InitHealthProfileViewerDisplay>({
      bmi: { level: 0, point: 0 },
      smokingStatusDisplay: 'habits-and-prevention.tobacco-smoking-status',
      alcoholUseFrequencyDisplay: 'habits-and-prevention.alcohol-use-frequency',
      vaccinatedGuidelinesDisplay:
        'habits-and-prevention.vaccinated-guidelines',
    });
  const calculateBMI = useCallback((heightCm?: number, weightKg?: number) => {
    if (!heightCm || !weightKg) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  }, []);

  useEffect(() => {
    const healthProfile = flattenQuestionnaireResponse(questionnaireResponse);
    if (!healthProfile) return;
    const bodyHeightItem = healthProfile.find(
      (item) => item.linkId === 'vital.body-height'
    );
    const bodyWeightItem = healthProfile.find(
      (item) => item.linkId === 'vital.body-weight'
    );
    const smokingStatusItem = healthProfile.find(
      (item) => item.linkId === 'habits-and-prevention.tobacco-smoking-status'
    );
    const alcoholUseFrequencyItem = healthProfile.find(
      (item) => item.linkId === 'habits-and-prevention.alcohol-use-frequency'
    );
    const vaccinatedGuidelinesItem = healthProfile.find(
      (item) => item.linkId === 'habits-and-prevention.vaccinated-guidelines'
    );

    const heightCm = bodyHeightItem?.value as number;
    const weightKg = bodyWeightItem?.value as number;
    const bmiPoint = calculateBMI(heightCm, weightKg);
    const bmiLevel =
      bmiPoint == 0
        ? bmiPoint
        : bmiPoint < 16
        ? 1
        : bmiPoint < 17
        ? 2
        : bmiPoint < 18.5
        ? 3
        : bmiPoint < 25
        ? 4
        : bmiPoint < 30
        ? 5
        : bmiPoint < 35
        ? 6
        : bmiPoint < 40
        ? 7
        : 8;
    setInitHealthProfileViewerDisplay({
      bmi: { level: bmiLevel, point: bmiPoint },
      smokingStatusDisplay: smokingStatusItem
        ? (`${smokingStatusItem.linkId}.${smokingStatusItem.value}` as string)
        : 'habits-and-prevention.tobacco-smoking-status',
      alcoholUseFrequencyDisplay: alcoholUseFrequencyItem
        ? (`${alcoholUseFrequencyItem.linkId}.${alcoholUseFrequencyItem.value}` as string)
        : 'habits-and-prevention.alcohol-use-frequency',
      vaccinatedGuidelinesDisplay: vaccinatedGuidelinesItem
        ? (`${vaccinatedGuidelinesItem.linkId}.${vaccinatedGuidelinesItem.value}` as string)
        : 'habits-and-prevention.vaccinated-guidelines',
    });
  }, [questionnaireResponse]);
  return (
    <div className="flex flex-row">
      <div className="flex flex-col items-center">
        <Image
          src={`/assets/images/bmi-male-${initHealthProfileViewerDisplay.bmi.level}.svg`}
          width={130}
          height={389}
          priority
          className="h-[400px] w-auto"
          alt="Init Health Profile Viewer"
        />
        <span className="mt-3">
          BMI: <strong>{initHealthProfileViewerDisplay.bmi.point}</strong>
        </span>
        <span className="font-bold">
          {bmiLevels[initHealthProfileViewerDisplay.bmi.level]}
        </span>
      </div>
      <div className="flex flex-col ml-4 gap-4">
        <Image
          src={`/assets/images/${initHealthProfileViewerDisplay.vaccinatedGuidelinesDisplay}.svg`}
          width={50}
          height={50}
          alt="Vaccinated Guidelines"
        />
        <Image
          src={`/assets/images/${initHealthProfileViewerDisplay.smokingStatusDisplay}.svg`}
          width={50}
          height={50}
          alt="Smoking Status"
        />
        <Image
          src={`/assets/images/${initHealthProfileViewerDisplay.alcoholUseFrequencyDisplay}.svg`}
          width={50}
          height={50}
          alt="Alcohol Use Frequency"
        />
      </div>
    </div>
  );
};

export default InitHealthProfileViewer;
