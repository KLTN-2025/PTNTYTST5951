import { z } from "zod";

export const patientInitInfoFormSchema = z.object({
  name: z.string().min(1, "Họ và tên không được để trống."),
  citizenIdentification: z
    .string()
    .min(1, "Số căn cước công dân không được để trống."),
  phone: z.string().min(1, "Số điện thoại không được để trống."),
  email: z.email("Địa chỉ email không hợp lệ."),
  gender: z
    .string()
    .min(1, "Giới tính không được để trống.")
    .refine((val) => val !== "none", {
      message: "Giới tính không được để trống.",
    }),
  birthdate: z.date("Ngày sinh không hợp lệ."),
});

export type PatientInitInfoFormData = z.infer<typeof patientInitInfoFormSchema>;
