import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  }

  async chargeCard(amount: number): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: amount * 100, // in cents ($)
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException(
        'Something went wrong while processing payment.',
      );
    }
  }
}
