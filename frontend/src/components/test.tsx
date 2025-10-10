"use client";
import React from "react";
import axios from "axios";

const TestComponent = () => {
  const sendPublicRequest = async () => {
    try {
      const response = await axios.get("/api/proxy/me");
      const data = response.data;
      console.log("Public Response:", data);
    } catch (error) {
      console.error("Error fetching public endpoint:", error);
    }
  };
  const sendPrivateRequest = async () => {
    try {
      const response = await axios.post("/api/proxy/identities/patient", {
        name: "Phan Thành Trung",
        beetaminId: "123",
        citizenIdentification: "066200",
        phone: "0916023064",
        gender: "male",
        birthdate: "2000-12-25",
      });
      const data = response.data;
      console.log("Private Response:", data);
    } catch (error) {
      console.error("Error fetching private endpoint:", error);
    }
  };
  return (
    <div>
      <button onClick={sendPublicRequest}>Button 1</button>
      <button onClick={sendPrivateRequest}>Button 2</button>
    </div>
  );
};

export default TestComponent;
