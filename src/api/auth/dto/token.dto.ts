import { IsJWT, IsNotEmpty } from 'class-validator';

export class TokenDto {
  @IsNotEmpty()
  @IsJWT({ message: 'Invalid token' })
  token: string;
}
