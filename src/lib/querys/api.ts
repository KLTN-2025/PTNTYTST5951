import { PatientInitInfoFormData } from "../schemas/setup-profile";
import { fetcher } from "./fetcher";

export async function getMyPatientInfo() {
  return fetcher("/patient/me");
}

export async function getPatientInfo() {
  return fetcher("/patients/info");
}

export async function setupNewPatient(input: PatientInitInfoFormData) {
  return fetcher("/identities/patient", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
