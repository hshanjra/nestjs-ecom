import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CheckoutSession,
  CheckoutSessionSchema,
} from 'src/schemas/checkout-session.schema';
import { StripeService } from 'src/utility/stripe/stripe.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CheckoutSession.name,
        schema: CheckoutSessionSchema,
      },
    ]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, StripeService],
})
export class CheckoutModule {}
