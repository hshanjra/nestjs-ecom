import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckoutSession,
  CheckoutSessionSchema,
} from 'src/schemas/checkout-session.schema';
import { StripeService } from 'src/utility/stripe/stripe.service';
import { TaxRate, TaxRateSchema } from 'src/schemas/tax-rate.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CheckoutSession.name,
        schema: CheckoutSessionSchema,
      },
      {
        name: TaxRate.name,
        schema: TaxRateSchema,
      },
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, StripeService],
})
export class CheckoutModule {}
