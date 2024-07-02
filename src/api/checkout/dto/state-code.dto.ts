import {
  IsNotEmpty,
  IsString,
  IsUppercase,
  MaxLength,
  MinLength,
} from 'class-validator';

export class StateCodeDto {
  @MaxLength(2)
  @MinLength(2)
  @IsNotEmpty()
  @IsUppercase()
  @IsString()
  stateCode: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;
}
