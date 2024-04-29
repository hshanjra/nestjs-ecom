import { IsNotEmpty, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
