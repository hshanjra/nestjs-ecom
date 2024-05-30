import {
  IsEmail,
  IsJWT,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @IsJWT({ message: 'Invalid token' })
  token: string;
}

export class EmailDto {
  @IsNotEmpty({ message: 'Email required.' })
  @IsEmail({}, { message: 'Invalid email.' })
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
