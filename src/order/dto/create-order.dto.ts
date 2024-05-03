import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../enums';

class ShippingDetailsDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  companyName: string;

  @IsNotEmpty()
  @IsPhoneNumber('US')
  phone: number;

  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateNested({ each: true })
  @Type(() => ShippingDetailsDto)
  @IsObject()
  @IsNotEmptyObject()
  billingAddress: ShippingDetailsDto;

  @ValidateNested({ each: true })
  @Type(() => ShippingDetailsDto)
  @IsObject()
  @IsNotEmptyObject()
  @IsOptional()
  shippingAddress: ShippingDetailsDto;

  @IsNotEmpty()
  @IsIn([PaymentMethod.CARD, PaymentMethod.PAYPAL])
  paymentMethod: PaymentMethod;
}
