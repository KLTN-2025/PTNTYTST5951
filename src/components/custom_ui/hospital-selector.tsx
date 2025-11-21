'use client';

import React, { useEffect } from 'react';
import { HospitalDataType } from '../form/register-organization';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { FieldError, FieldGroup } from '../ui/field';

type HospitalSelectorProps = {
  organizationType: 'hospital' | 'clinic';
  form: any;
  hospitalData: HospitalDataType[];
};

const HospitalSelector: React.FC<HospitalSelectorProps> = ({
  organizationType,
  form,
  hospitalData,
}) => {
  useEffect(() => {
    if (organizationType !== 'hospital') {
      form.setFieldValue('hospitalId', '');
    }
  }, [organizationType, form]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-row gap-4">
        {/* Tỉnh / thành phố */}
        <FieldGroup>
          <form.Field
            name="stateId"
            children={(field: any) => (
              <div className="flex flex-col gap-2 flex-1">
                <Label htmlFor="stateSelector">Tỉnh/thành phố</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    // Đổi tỉnh
                    field.handleChange(value);

                    // Reset các field phụ thuộc
                    form.setFieldValue('districtId', '');
                    form.setFieldValue('hospitalId', '');
                    if (organizationType === 'hospital') {
                      form.setFieldValue('organizationName', '');
                    }
                  }}
                >
                  <SelectTrigger
                    onBlur={field.handleBlur}
                    className="w-full"
                    id="stateSelector"
                  >
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tỉnh/thành phố</SelectLabel>
                      {hospitalData.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <div>
                    <FieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </div>
            )}
          />
        </FieldGroup>

        {/* Quận/huyện + Bệnh viện (nếu type = hospital) */}
        <form.Subscribe
          selector={(state: any) => ({
            stateId: state.values.stateId as string | undefined,
            districtId: state.values.districtId as string | undefined,
          })}
          children={({
            stateId,
            districtId,
          }: {
            stateId: string | undefined;
            districtId: string | undefined;
          }) => (
            <>
              {/* Quận / huyện */}
              <FieldGroup>
                <form.Field
                  name="districtId"
                  children={(field: any) => (
                    <div className="flex flex-col gap-2 flex-1">
                      <Label htmlFor="districtSelector">Quận/huyện</Label>
                      <Select
                        key={stateId ?? 'district'}
                        value={stateId ? field.state.value : undefined}
                        onValueChange={(value) => {
                          // Đổi quận
                          field.handleChange(value);

                          // Reset các field phụ thuộc
                          form.setFieldValue('hospitalId', '');
                          if (organizationType === 'hospital') {
                            form.setFieldValue('organizationName', '');
                          }
                        }}
                        disabled={!stateId}
                      >
                        <SelectTrigger
                          onBlur={field.handleBlur}
                          className="w-full"
                          id="districtSelector"
                        >
                          <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Quận/huyện</SelectLabel>
                            {hospitalData
                              .find((state) => state.id === stateId)
                              ?.childs.map((district) => (
                                <SelectItem
                                  key={district.id}
                                  value={district.id}
                                >
                                  {district.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {field.state.meta.isTouched &&
                        !field.state.meta.isValid && (
                          <div>
                            <FieldError errors={field.state.meta.errors} />
                          </div>
                        )}
                    </div>
                  )}
                />
              </FieldGroup>

              {/* Bệnh viện – chỉ hiện khi organizationType = hospital */}
              {organizationType === 'hospital' && (
                <FieldGroup>
                  <form.Field
                    name="hospitalId"
                    listeners={{
                      onChange: ({ value }: { value: string }) => {
                        const selected = hospitalData
                          .find((state) => state.id === stateId)
                          ?.childs.find(
                            (district) => district.id === districtId
                          )
                          ?.childs.find((hospital) => hospital.id === value);

                        // Gán organizationName theo tên bệnh viện
                        form.setFieldValue(
                          'organizationName',
                          selected?.name ?? ''
                        );
                      },
                    }}
                    children={(field: any) => (
                      <div className="flex flex-col gap-2 flex-1">
                        <Label htmlFor="hospitalSelector">Bệnh viện</Label>
                        <Select
                          key={`${stateId ?? 'state'}-${
                            districtId ?? 'district'
                          }`}
                          value={districtId ? field.state.value : undefined}
                          onValueChange={field.handleChange}
                          disabled={!districtId}
                        >
                          <SelectTrigger
                            onBlur={field.handleBlur}
                            className="w-full"
                            id="hospitalSelector"
                          >
                            <SelectValue placeholder="Chọn bệnh viện" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Bệnh viện</SelectLabel>
                              {hospitalData
                                .find((state) => state.id === stateId)
                                ?.childs.find(
                                  (district) => district.id === districtId
                                )
                                ?.childs.map((hospital) => (
                                  <SelectItem
                                    key={hospital.id}
                                    value={hospital.id}
                                  >
                                    {hospital.name}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {field.state.meta.isTouched &&
                          !field.state.meta.isValid && (
                            <div>
                              <FieldError errors={field.state.meta.errors} />
                            </div>
                          )}
                      </div>
                    )}
                  />
                </FieldGroup>
              )}
            </>
          )}
        />
      </div>

      {/* Địa chỉ */}
      <form.Field
        name="street"
        children={(field: any) => (
          <div className="w-full grid gap-2 items-center">
            <Label htmlFor="street">Địa chỉ</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Vui lòng nhập số nhà và tên đường"
            />
            {field.state.meta.isTouched && !field.state.meta.isValid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </div>
        )}
      />
    </div>
  );
};

export default HospitalSelector;
