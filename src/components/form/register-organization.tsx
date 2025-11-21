'use client';
import React, { useEffect, useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import HospitalSelector from '../custom_ui/hospital-selector';
import { toast } from 'sonner';
import z from 'zod';
import { useForm } from '@tanstack/react-form';
import { FieldError, FieldGroup } from '../ui/field';
import { Address, CodeableConcept, ContactPoint, Identifier } from 'fhir/r4';
import { useRegisterPractitionerOrganizationMutation } from '@/hooks/practitioner';

export type HospitalDataType = {
  id: string;
  name: string;
  province: string;
  childs: Array<{
    id: string;
    name: string;
    childs: Array<{
      id: string;
      name: string;
    }>;
  }>;
};

const RegisterOrganizationForm = () => {
  const [hospitalData, setHospitalData] = useState<HospitalDataType[]>([]);
  const { mutateAsync } = useRegisterPractitionerOrganizationMutation();

  const hospitalSchema = z.object({
    organizationType: z.literal('hospital'),
    stateId: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    districtId: z.string().min(1, 'Vui lòng chọn quận/huyện'),
    hospitalId: z
      .string('Vui lòng chọn bệnh viện')
      .min(1, 'Vui lòng chọn bệnh viện'),
    organizationName: z.string().min(1, 'Vui lòng nhập tên cơ sở'),
    street: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể'),
    contactEmail: z.email('Email không hợp lệ'),
    contactPhone: z.string().min(1, 'Vui lòng nhập số điện thoại liên hệ'),
  });

  const clinicSchema = z.object({
    organizationType: z.literal('clinic'),
    stateId: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    districtId: z.string().min(1, 'Vui lòng chọn quận/huyện'),
    organizationName: z.string().min(1, 'Vui lòng nhập tên cơ sở'),
    street: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể'),
    contactEmail: z.email('Email không hợp lệ'),
    contactPhone: z.string().min(1, 'Vui lòng nhập số điện thoại liên hệ'),
  });

  const formSchema = z.discriminatedUnion('organizationType', [
    hospitalSchema,
    clinicSchema,
  ]);
  const defaultValues = {
    organizationType: 'hospital' as 'hospital' | 'clinic',
    stateId: '',
    districtId: '',
    street: '',
    organizationName: '',
    contactEmail: '',
    contactPhone: '',
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async (formData) => {
      const formValue = formData.value;

      const telecom: ContactPoint[] = [
        { system: 'email', value: formValue.contactEmail, use: 'work' },
        {
          system: 'phone',
          value: formValue.contactPhone,
          use: 'work',
        },
      ];

      const selectedState = hospitalData.find(
        (state) => state.id === formValue.stateId
      );
      const selectedDistrict = selectedState?.childs.find(
        (district) => district.id === formValue.districtId
      );

      const hospitalId = (formValue as { hospitalId?: string }).hospitalId;

      const type: CodeableConcept = {
        coding: [
          {
            system: 'https://beetamin.hivevn.net/fhir/CodeSystem/org-type',
            code: formValue.organizationType,
          },
        ],
      };

      const address: Address = {
        use: 'work',
        type: 'both',
        line: [formValue.street],
        state: hospitalData.find((state) => state.id === formValue.stateId)?.id,
        district: hospitalData
          .find((state) => state.id === formValue.stateId)
          ?.childs.find((district) => district.id === formValue.districtId)?.id,
        country: 'VN',
      };

      const formBody: any = {
        type,
        name: formValue.organizationName,
        address,
        telecom,
      };

      if (hospitalId) {
        const identifier: Identifier = {
          system: 'https://beetamin.hivevn.net/fhir/Identifier/hospital-id-vn',
          value: hospitalId,
        };
        Object.assign(formBody, { identifier });
      }

      try {
        await mutateAsync(formBody);
        toast.success('Đăng ký cơ sở Y Tế thành công!');
        form.reset();
      } catch (error: any) {
        console.error('Register org error:', error);
        toast.error(
          error?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
        );
      }
    },
  });

  useEffect(() => {
    fetch('/assets/data/vn-hospital.json')
      .then((res) => res.json())
      .then((json) => setHospitalData(json));
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-300 shadow-sm w-full">
      <h1 className="text-2xl font-semibold mb-4">Đăng ký cơ sở Y Tế mới</h1>
      <form
        className="flex flex-col gap-4"
        id="register-organization-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="organizationType"
            listeners={{
              onChange: () => {
                form.setFieldValue('organizationName', '');
              },
            }}
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex flex-col w-full">
                  <RadioGroup
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onValueChange={(value: 'hospital' | 'clinic') => {
                      field.handleChange(value);
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="hospital" id="hospital-rb" />
                      <Label htmlFor="hospital-rb">Bệnh viện</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="clinic" id="clinic-rb" />
                      <Label htmlFor="clinic-rb">Phòng khám</Label>
                    </div>
                  </RadioGroup>
                  {field.state.meta.isTouched && isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </div>
              );
            }}
          ></form.Field>
        </FieldGroup>
        <form.Subscribe
          selector={(state) => state.values.organizationType}
          children={(organizationType) => (
            <>
              <FieldGroup>
                <form.Field
                  name="organizationName"
                  children={(field) => (
                    <div
                      className={`grid w-full items-center gap-3 ${
                        organizationType === 'hospital' && 'hidden'
                      }`}
                    >
                      <Label htmlFor="organizationName">Tên cơ sở</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Vui lòng nhập tên cơ sở"
                      />
                      {field.state.meta.isTouched &&
                        !field.state.meta.isValid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                    </div>
                  )}
                ></form.Field>
              </FieldGroup>
              <HospitalSelector
                organizationType={organizationType}
                form={form}
                hospitalData={hospitalData}
              />
            </>
          )}
        ></form.Subscribe>
        <div className="w-full flex flex-row gap-4">
          <FieldGroup>
            <form.Field
              name="contactEmail"
              children={(field) => (
                <div className="w-full grid gap-2 flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Vui lòng nhập email liên hệ"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <div className="text-sm text-red-600 mt-1">
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </div>
              )}
            ></form.Field>
          </FieldGroup>
          <FieldGroup>
            <form.Field
              name="contactPhone"
              children={(field) => (
                <div className="w-full grid gap-2 flex-1">
                  <Label htmlFor="phoneNumber">Số điện thoại liên hệ</Label>
                  <Input
                    type="text"
                    id="phoneNumber"
                    placeholder="Vui lòng nhập số điện thoại liên hệ"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <div className="text-sm text-red-600 mt-1">
                      <FieldError errors={field.state.meta.errors} />
                    </div>
                  )}
                </div>
              )}
            ></form.Field>
          </FieldGroup>
        </div>
        <button
          type="submit"
          form="register-organization-form"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition"
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default RegisterOrganizationForm;
