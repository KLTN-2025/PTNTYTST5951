import { queryOptions } from "@tanstack/react-query";
import { getMyPatientInfo, testRole } from "./api";

export const getPatientInfoQuery = queryOptions({
  queryKey: ["patient"],
  queryFn: () => getMyPatientInfo(),
});

export const testRoleQuery = queryOptions({
  queryKey: ["patient-test-role"],
  queryFn: () => testRole(),
});
