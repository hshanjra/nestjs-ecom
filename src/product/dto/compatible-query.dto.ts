import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompatiblePartsQuery {
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: any;

  @IsString()
  @IsOptional()
  subModel?: string;

  @IsString()
  @IsOptional()
  engine?: string;

  @IsNumberString()
  @IsNotEmpty()
  year: any;
}
