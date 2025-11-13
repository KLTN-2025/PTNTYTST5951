import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { z } from 'zod';
import { ApiError } from '@/libs/fetcher';

export const identityInfoFormSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống.'),
  citizenIdentification: z
    .string()
    .trim()
    .regex(/^\d{12}$/, {
      message: 'CCCD không hợp lệ. Vui lòng nhập căn cước 12 số.',
    }),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9}|[1-9]\d{8})$/, {
      message: 'Số điện thoại không hợp lệ',
    }),
  email: z.email('Địa chỉ email không hợp lệ.'),
  gender: z.enum(['male', 'female'], {
    error: 'Giới tính không hợp lệ.',
  }),
  birthdate: z.date('Ngày sinh không hợp lệ.'),
});

export type IdentityInfoFormData = z.infer<typeof identityInfoFormSchema>;

const genders = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
] as const;

type RegisterProfileFormProps = {
  id?: string;
  isSubmitting?: boolean;
  defaultValues: IdentityInfoFormData;
  submitError?: ApiError | null;
  onSubmit: (values: IdentityInfoFormData) => void | Promise<void>;
};

type ConflictErrorDetail = {
  field: 'email' | 'citizenIdentification' | 'phone';
  message: string;
};

export function RegisterProfileForm({
  id = 'register-profile-form',
  isSubmitting,
  defaultValues,
  submitError,
  onSubmit,
}: RegisterProfileFormProps) {
  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>();
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: identityInfoFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as IdentityInfoFormData);
    },
  });

  React.useEffect(() => {
    if (submitError) {
      setErrorMessage(submitError.message);
      if (submitError.statusCode === 409) {
        const errorDetail = submitError.error as ConflictErrorDetail[];
        for (const detail of errorDetail) {
          form.fieldInfo[detail.field].instance?.setErrorMap({
            onSubmit: [
              {
                message: 'Thông tin bị trùng lặp với một tài khoản khác',
              },
            ],
          });
        }
      }
    } else {
      setErrorMessage(undefined);
    }
  }, [submitError]);
  return (
    <Card className="w-full sm:max-w-lg">
      <CardHeader>
        <CardTitle>Thiết lập hồ sơ cá nhân</CardTitle>
        <CardDescription>
          Vui lòng cung cấp thông tin cá nhân của bạn để hoàn tất hồ sơ.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        </div>
        <form
          id={id}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Email<span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Nhập địa chỉ email"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <form.Field
              name="citizenIdentification"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Số căn cước công dân
                        <span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Nhập số căn cước công dân"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Họ và tên<span className="text-red-600">*</span>
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Nhập họ và tên"
                        autoComplete="off"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <form.Field
              name="phone"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>
                        Số điện thoại<span className="text-red-600">*</span>
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Nhập số điện thoại"
                          autoComplete="off"
                        />
                        <InputGroupAddon>
                          <label>+84</label>
                        </InputGroupAddon>
                      </InputGroup>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                  </Field>
                );
              }}
            />

            <div className="flex gap-2">
              <form.Field
                name="gender"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Giới tính<span className="text-red-600">*</span>
                        </FieldLabel>
                        <Select
                          name={field.name}
                          onValueChange={(value) =>
                            field.handleChange(
                              (value === 'none'
                                ? undefined
                                : (value as IdentityInfoFormData['gender'])) as any
                            )
                          }
                          value={field.state.value}
                        >
                          <SelectTrigger className="w-full" id={field.name}>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Chọn giới tính</SelectItem>
                            <SelectSeparator />
                            {genders.map((gender) => (
                              <SelectItem
                                key={gender.value}
                                value={gender.value}
                              >
                                {gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                    </Field>
                  );
                }}
              />

              <form.Field
                name="birthdate"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;

                  return (
                    <Field data-invalid={isInvalid} className="flex-1">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Ngày sinh<span className="text-red-600">*</span>
                        </FieldLabel>
                        <Popover
                          open={openDatePicker}
                          onOpenChange={setOpenDatePicker}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              id={field.name}
                              name={field.name}
                              className="justify-between font-normal"
                            >
                              {field.state.value
                                ? field.state.value.toLocaleDateString()
                                : 'Chọn ngày sinh'}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                if (!date) return;
                                field.handleChange(date);
                                setOpenDatePicker(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldContent>
                    </Field>
                  );
                }}
              />
            </div>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form={id} className="w-full bg-primary">
          {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      </CardFooter>
    </Card>
  );
}
