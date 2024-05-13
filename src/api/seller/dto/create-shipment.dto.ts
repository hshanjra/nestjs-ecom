import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Max,
} from 'class-validator';
import { ShippingCarrier } from '../../order/enums';

export class CreateShipmentDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;

  @IsNumberString()
  @IsNotEmpty()
  orderedQty: number;

  @IsNumberString()
  @IsNotEmpty()
  qtyInThisShipment: number;

  @IsString()
  @IsNotEmpty()
  @Max(20)
  trackingId: string;

  @IsEnum(ShippingCarrier)
  @IsNotEmpty()
  shippedThrough: ShippingCarrier;

  @IsNotEmpty()
  @IsDateString()
  shippedAt: Date;
}
