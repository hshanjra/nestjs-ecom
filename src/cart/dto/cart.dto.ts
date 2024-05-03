import {
  IsDecimal,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CartDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;

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
  stateCode: string;
}
