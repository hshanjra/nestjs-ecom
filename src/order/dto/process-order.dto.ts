import { IsDateString, IsNumberString, IsString } from 'class-validator';

export class ProcessOrderDto {
  @IsNumberString()
  trackingId: number;

  @IsString()
  shippingCarrier: string;

  @IsDateString()
  shippedAt: Date;
}
