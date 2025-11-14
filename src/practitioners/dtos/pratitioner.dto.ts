export class PractitionerDto {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  photo?: string;
  qualifications?: string[];
}
