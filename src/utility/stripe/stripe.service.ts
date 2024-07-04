import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { paymentResponse } from 'src/api/order/enums';
import { Order } from 'src/schemas/order.schema';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {
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
        amount: this.fixAmount(amount), // in cents ($)
        currency: 'usd',
        receipt_email: user?.email,
        customer: user && user?.sCustId,
        automatic_payment_methods: { enabled: true },
        // payment_method_types: ['card', 'paypal'],
      });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException(
        'Something went wrong while processing payment.',
      );
    }
  }

  async updatePaymentIntent(
    intentId: string,
    metadata: any,
    shippingAddress?: any,
    customer_email?: string,
  ) {
    try {
      return await this.stripe.paymentIntents.update(intentId, {
        receipt_email: customer_email || '',
        metadata: {
          orderId: metadata?.orderId,
          // purchased_items: JSON.stringify(metadata?.purchased_items),
          // shippingAddress: JSON.stringify(shippingAddress),
        },
        shipping: {
          name: `${shippingAddress?.firstName} ${shippingAddress?.lastName}`,
          address: {
            line1: shippingAddress?.streetAddress || '',
            state: shippingAddress?.state || '',
            city: shippingAddress?.city || '',
            postal_code: shippingAddress?.zipCode || '',
            country: shippingAddress?.country || '',
          },
          phone: shippingAddress?.phone || '',
        },
      });
    } catch (error) {
      console.log(error);
      throw new UnprocessableEntityException(
        'Something went wrong while processing payment.',
      );
    }
  }

  async handleWebhook(
    signature: string,
    req: RawBodyRequest<Request>,
    res: Response,
  ) {
    if (!signature) new BadRequestException('Invalid signature');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      // On error, log and return the error message
      console.log(`❌ Error message: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Successfully constructed event
    console.log('✅ Success:', event.id);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.canceled':
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        await this.orderModel.findOneAndUpdate(
          {
            orderId: paymentIntentCanceled.metadata.orderId,
          },
          {
            paymentResponse: {
              status: paymentResponse.PAYMENT_CANCELED,
              responseData: paymentIntentCanceled,
            },
          },
        );
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentPaymentFailed = event.data.object;
        await this.orderModel.findOneAndUpdate(
          {
            orderId: paymentIntentPaymentFailed.metadata.orderId,
          },
          {
            paymentResponse: {
              status: paymentResponse.PAYMENT_FAILED,
              responseData: paymentIntentPaymentFailed,
            },
          },
        );
        break;
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;
        await this.orderModel.findOneAndUpdate(
          {
            orderId: paymentIntentSucceeded.metadata.orderId,
          },
          {
            isPaid: true,
            paidAt: paymentIntentSucceeded.created,
            paymentResponse: {
              status: paymentResponse.PAYMENT_SUCCESS,
              responseData: paymentIntentSucceeded,
            },
          },
        );
        break;

      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  }

  /* This function round off the amount and returns in cents */
  private fixAmount(value: number): number {
    return Math.round(value * 100);
  }
}
