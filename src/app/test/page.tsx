"use client";
import { useSession } from "next-auth/react";
import React from "react";

const TestPage = () => {
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  const fetchPatientData = async () => {
    console.log("Fetching patient data...");
    const response = await fetch("http://localhost:8182/fhir/Patient", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    console.log("Patient Data:", data);
  };
  const fetchUserData = async () => {
    console.log("Fetching user data...");
    const response = await fetch("http://localhost:8182/fhir/User", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    console.log("User Data:", data);
  };
  return (
    <div>
      <h1>Test Page</h1>
      <button onClick={fetchPatientData}>Fetch Patient Data</button>
      <button onClick={fetchUserData}>Fetch User Data</button>
    </div>
  );
};

export default TestPage;
