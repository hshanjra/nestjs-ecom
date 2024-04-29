import {
  IsDecimal,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsString,
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
}
