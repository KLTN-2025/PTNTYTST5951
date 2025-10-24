import { useMutation, useQueryClient } from "@tanstack/react-query";

import { PatientInitInfoFormData } from "../schemas/setup-profile";
import { setupNewPatient } from "./api";

export function useSetupNewPatientMutation() {
  return useMutation({
    mutationFn: (input: PatientInitInfoFormData) => setupNewPatient(input),
  });
}
