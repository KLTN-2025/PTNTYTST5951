import InfoView from '@/components/custom_ui/info-view';
import {
  IdentityInfoFormData,
  RegisterProfileForm,
} from '@/components/form/register-profile';
import {
  usePatientInfoQuery,
  useUpdatePractitionerProfileMutation,
} from '@/hooks/practitioner';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PatientProfile = () => {
  const { data, isFetching, isError, error } = usePatientInfoQuery();
  const [formDefaultValues, setFormDefaultValues] =
    useState<IdentityInfoFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const {
    mutate: updatePractitionerProfile,
    isPending: isUpdating,
    isSuccess: isUpdated,
    isError: isUpdateError,
    error: updateError,
  } = useUpdatePractitionerProfileMutation();

  useEffect(() => {
    if (data) {
      const defaultValues: IdentityInfoFormData = {
        citizenIdentification: data.citizenIdentification || '',
        phone: data.phone || '',
        email: data.email || '',
        gender: data.gender || 'male',
        birthDate: data.birthDate ? new Date(data.birthDate) : new Date(),
        name: data.name || '',
      };
      setFormDefaultValues(defaultValues);
    }
  }, [data]);
  const onSubmit = async (values: IdentityInfoFormData) => {
    updatePractitionerProfile(values);
  };
  useEffect(() => {
    if (isUpdated) {
      toast.success('Cập nhật hồ sơ thành công.');
      setIsEditing(false);
    }
    if (isUpdateError) {
      toast.error('Cập nhật hồ sơ thất bại.');
    }
  }, [isUpdated, isUpdateError]);
  useEffect(() => {
    if (isError || error) {
      toast.error(error.message);
    }
  }, [isError, error]);

  if (isFetching) {
    return <>Loading</>;
  }

  if (isError) {
    return <>Error</>;
  }

  if (!data || !formDefaultValues) {
    return <>No data available.</>;
  }
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between mb-2">
        <h2 className="text-2xl font-semibold">Practitioner Profile</h2>
        <button
          className={`${isEditing && 'text-orange-600'} underline`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {isEditing ? (
        <RegisterProfileForm
          isEditing={true}
          id="practitioner-register-form"
          submitError={updateError}
          defaultValues={formDefaultValues}
          isSubmitting={isUpdating}
          onSubmit={onSubmit}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <InfoView title="Full Name" value={data.name} />
          <InfoView title="Email" value={data.email} />
          <InfoView title="Phone" value={`+84${data.phone}`} />
          <InfoView title="Gender" value={data.gender} />
          <InfoView
            title="Birth Date"
            value={new Date(data.birthDate as string).toLocaleDateString(
              'vi-VN',
              {
                timeZone: 'Asia/Ho_Chi_Minh',
              }
            )}
          />
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
