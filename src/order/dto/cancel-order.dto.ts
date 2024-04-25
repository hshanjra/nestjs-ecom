import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['STOCK_OUT', 'CUSTOMER_ASKED_TO_CANCEL'])
  cancellationReason: string;

  @IsString()
  description: string;
}
