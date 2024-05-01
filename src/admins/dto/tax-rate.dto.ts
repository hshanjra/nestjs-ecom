import {
  IsDecimal,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUppercase,
  MaxLength,
  MinLength,
} from 'class-validator';

export class TaxRateDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(2)
  @MinLength(2)
  @IsUppercase()
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  @MinLength(2)
  @IsUppercase()
  stateCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  city: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsDecimal()
  taxRate: number;

  @IsString()
  @IsNotEmpty()
  taxName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  taxClass: string;
}
