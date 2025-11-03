import { queryOptions } from "@tanstack/react-query";
import { getMyPatientInfo, getPatientInfo } from "./api";

export const getMyPatientInfoQuery = queryOptions({
  queryKey: ["my-patient-info"],
  queryFn: () => getMyPatientInfo(),
});

export const getPatientInfoQuery = queryOptions({
  queryKey: ["patient-info"],
  queryFn: () => getPatientInfo(),
});
