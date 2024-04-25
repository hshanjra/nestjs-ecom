import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddPayoutMethodDto {
  @IsString()
  @IsIn(['PAYPAL'])
  methodName: string;

  @IsString()
  @IsNotEmpty()
  payoutMethodAddress: string;
}
