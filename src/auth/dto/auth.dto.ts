import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class AuthPayloadDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  // @IsString()
  // @IsNotEmpty()
  // username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a correct email address' })
  email: string;

  @IsPhoneNumber('US')
  phone: string;

  @IsOptional()
  @IsIn(['CUSTOMER', 'SELLER'])
  role: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
