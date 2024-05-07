import {
  IsDecimal,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUppercase,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: any;

  @IsNotEmpty()
  @IsNumberString()
  @IsDecimal(
    {
      force_decimal: false,
      decimal_digits: '0',
    },
    { message: 'Please enter a valid quantity.' },
  )
  qty: number;

  @IsOptional()
  @MaxLength(2)
  @MinLength(2)
  @IsNotEmpty()
  @IsUppercase()
  stateCode: string;
}
