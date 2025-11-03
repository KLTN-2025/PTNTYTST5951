import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

import { PatientInitInfoFormData } from "../schemas/setup-profile";
import { setupNewPatient } from "./api";
import { FetcherError } from "./fetcher";

export function useSetupNewPatientMutation(): UseMutationResult<
  any,
  FetcherError,
  PatientInitInfoFormData
> {
  return useMutation({
    mutationFn: (input: PatientInitInfoFormData) => setupNewPatient(input),
  });
}
