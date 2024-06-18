import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async chargeCard(
    amount: number,
    user?: Express.User,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: this.roundOff(amount) * 100, // in cents ($)
        currency: 'usd',
        // metadata: { purchased_items: JSON.stringify(purchased_items) },
        customer: user && user?.sCustId,
        automatic_payment_methods: { enabled: true },
      });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException(
        'Something went wrong while processing payment.',
      );
    }
  }

  private roundOff(value: number) {
    return Math.round(value);
  }
}
