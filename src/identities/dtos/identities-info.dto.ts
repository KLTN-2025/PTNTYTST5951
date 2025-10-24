import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
export class InitIdentitiesInfoDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty({
    message: 'Số CCCD/CMND không được để trống.',
  })
  citizenIdentification: string;

  @IsNotEmpty({
    message: 'Số điện thoại không được để trống.',
  })
  phone: string;

  @IsNotEmpty({
    message: 'Email không được để trống.',
  })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(['other', 'male', 'female', 'unknown'])
  gender: 'other' | 'male' | 'female' | 'unknown' | undefined;

  @IsNotEmpty()
  @IsDateString()
  birthdate: string;
}

export class PatientContactHandlerDto {
  @IsNotEmpty()
  @IsEnum(['add', 'edit', 'remove'], {
    message: 'trường type không hợp lệ.',
  })
  type: 'add' | 'edit' | 'remove';

  @ValidateIf(
    (o: PatientContactHandlerDto) => o.type === 'edit' || o.type === 'remove',
  )
  @IsNotEmpty({
    message: 'trường index không được để trống.',
  })
  @IsNumber({}, { message: 'Giá trị index không hợp lệ.' })
  index?: number;

  @ValidateIf((o: PatientContactHandlerDto) => o.type === 'add')
  @IsNotEmpty({
    message: 'Mối quan hệ không được để trống.',
  })
  relationship?: string;

  @ValidateIf((o: PatientContactHandlerDto) => o.type === 'add')
  @IsNotEmpty({
    message: 'Vai trò không được để trống.',
  })
  role?: string;

  @ValidateIf((o: PatientContactHandlerDto) => o.type === 'add')
  @IsNotEmpty({
    message: 'Tên không được để trống.',
  })
  name?: string;

  @ValidateIf((o: PatientContactHandlerDto) => o.type === 'add')
  @IsNotEmpty({
    message: 'Số điện thoại không được để trống.',
  })
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
