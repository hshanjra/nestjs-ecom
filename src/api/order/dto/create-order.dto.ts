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
  @IsOptional()
  companyName: string;

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
  // @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsString()
  // @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  paymentId: string;

  @ValidateNested({ each: true })
  @Type(() => ShippingDetailsDto)
  @IsObject()
  @IsNotEmptyObject()
  billingAddress: ShippingDetailsDto;

  // @IsNotEmpty()
  @IsOptional()
  @IsPhoneNumber('US', { message: 'Invalid phone number' })
  billingPhone: number;

  // @IsNotEmpty()
  @IsOptional()
  @IsPhoneNumber('US', { message: 'Invalid phone number' })
  shippingPhone: number;

  @ValidateNested({ each: true })
  @Type(() => ShippingDetailsDto)
  @IsObject()
  @IsNotEmptyObject()
  @IsOptional()
  shippingAddress: ShippingDetailsDto;

  @IsNotEmpty()
  @IsIn([PaymentMethod.CARD, PaymentMethod.PAYPAL, PaymentMethod.STRIPE])
  paymentMethod: PaymentMethod;
}
