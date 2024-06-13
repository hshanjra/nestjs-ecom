import { IsNotEmpty, IsString } from 'class-validator';

export class SessionDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
