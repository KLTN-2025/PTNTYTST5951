'use client';
import PatientProfile from './patient-profile';
import PractitionerQualifications from './practitioner-qualifications';

const DoctorProfilePage = () => {
  return (
    <div className="w-full grid grid-cols-2 min-[1200px]:grid-cols-3 gap-5">
      <div className="p-5 flex flex-col bg-white rounded-lg shadow">
        <PatientProfile />
      </div>
      <div className="p-5 min-[1200px]:col-span-2 flex flex-col bg-white rounded-lg shadow">
        <PractitionerQualifications />
      </div>
    </div>
  );
};

export default DoctorProfilePage;
