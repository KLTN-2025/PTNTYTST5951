"use client";
import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useSession } from "next-auth/react";
import { useSetupNewPatientMutation } from "@/lib/querys/mutations";
import { useQuery } from "@tanstack/react-query";
import { testRoleQuery } from "@/lib/querys/queries";
import { patientInitInfoFormSchema } from "@/lib/schemas/setup-profile";
import { toast } from "sonner";
import { signOut } from "@/auth";
import { signOutAction } from "@/actions/auth";

const genders = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
] as const;

export function SetupProfilePage() {
  const {
    mutate: setupNewPatient,
    isPending: isSetupNewPatientMutationPending,
    status: setupNewPatientMutationStatus,
    error: setupNewPatientMutationError,
  } = useSetupNewPatientMutation();

  useQuery(testRoleQuery);

  const [openDatePicker, setOpenDatePicker] = React.useState(false);
  const { data: session } = useSession();
  const form = useForm({
    defaultValues: {
      name: session?.user.name || "",
      email: session?.user.email || "",
      phone: "0916023064",
      citizenIdentification: "066200018836",
      gender: "male",
      birthdate: new Date(),
    },
    validators: {
      onSubmit: patientInitInfoFormSchema,
    },
    onSubmit: async ({ value }) => {
      setupNewPatient(value);
    },
  });

  React.useEffect(() => {
    if (setupNewPatientMutationStatus === "success") {
      toast.success(
        "Hồ sơ cá nhân đã được thiết lập thành công! Đăng nhập lại để tiếp tục."
      );
      signOutAction({ redirectTo: "/login" });
    } else if (setupNewPatientMutationStatus === "error") {
      toast.error(
        `Thiết lập hồ sơ cá nhân thất bại: ${
          (setupNewPatientMutationError as any)?.message ??
          String(setupNewPatientMutationError)
        }`
      );
      type Field = "email" | "citizenIdentification" | "phone";
      type ErrorShape = Partial<Record<Field, unknown>>;

      if ((setupNewPatientMutationError as any)?.statusCode === 409) {
        const err = ((setupNewPatientMutationError as any)?.error ??
          {}) as ErrorShape;

        const config: ReadonlyArray<[Field, string]> = [
          ["email", "Email đã được sử dụng bởi người dùng khác."],
          [
            "citizenIdentification",
            "Số căn cước công dân đã được sử dụng bởi người dùng khác.",
          ],
          ["phone", "Số điện thoại đã được sử dụng bởi người dùng khác."],
        ] as const;

        for (const [field, message] of config) {
          if (err[field]) {
            form.fieldInfo[field].instance?.setErrorMap({
              onSubmit: [{ message }],
            });
          }
        }
      }
    }
  }, [setupNewPatientMutationError, setupNewPatientMutationStatus]);
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card className="w-full sm:max-w-lg">
        <CardHeader>
          <CardTitle>Thiết lập hồ sơ cá nhân</CardTitle>
          <CardDescription>
            Vui lòng cung cấp thông tin cá nhân của bạn để hoàn tất hồ sơ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="setup-profile-form"
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
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
                        <FieldLabel htmlFor={field.name}>Họ và tên</FieldLabel>
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
                          Số điện thoại
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Nhập số điện thoại"
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
              <div className="flex gap-2">
                <form.Field
                  name="gender"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="flex-1">
                        <FieldContent>
                          <FieldLabel htmlFor="form-tanstack-select-gender">
                            Giới tính
                          </FieldLabel>
                          <Select
                            onValueChange={(value) => field.handleChange(value)}
                            value={field.state.value}
                          >
                            <SelectTrigger
                              id="form-tanstack-select-gender"
                              className="w-full"
                            >
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                Chọn giới tính
                              </SelectItem>
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
                            Ngày sinh
                          </FieldLabel>
                          <Popover
                            open={openDatePicker}
                            onOpenChange={setOpenDatePicker}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                type="button"
                                id="date"
                                className="justify-between font-normal"
                              >
                                {field.state.value
                                  ? field.state.value.toLocaleDateString()
                                  : "Chọn ngày sinh"}
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
                                  field.handleChange(date!);
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

              <form.Field
                name="beetaminId"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="hidden">
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Mã số beetamin
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Nhập mã số beetamin"
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
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success("This is a test notification!")}
          >
            Test
          </Button>
          <Button
            type="submit"
            disabled={isSetupNewPatientMutationPending}
            form="setup-profile-form"
            className="w-full bg-primary"
          >
            {isSetupNewPatientMutationPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SetupProfilePage;
