export class PractitionerDto {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  citizenIdentification?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  photo?: string;
  qualifications?: string[];
}
