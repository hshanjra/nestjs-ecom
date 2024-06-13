import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from 'src/interfaces/cart';
import { CheckoutSession } from 'src/schemas/checkout-session.schema';
import generateRandomString from 'src/utility/generateRandomString.util';
import { StripeService } from 'src/utility/stripe/stripe.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(CheckoutSession.name)
    private checkoutSession: Model<CheckoutSession>,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(cart: ICart) {
    if (!cart) throw new BadRequestException('Cart is empty.');

    const sid = 'cs_' + generateRandomString(78);

    const session = await this.checkoutSession.create({
      cart: cart,
      sessionId: sid,
    });
    return { sessionId: session.sessionId };
  }

  async validateCheckoutSession(sessionId: string, cart: ICart) {
    if (!cart) throw new BadRequestException('Cart not found.');
    const session = await this.checkoutSession
      .findOne({ sessionId })
      .select('cart -_id');

    if (
      !session ||
      new Date() > new Date(session.expiresAt) ||
      session.isPaid
    ) {
      throw new NotFoundException('Invalid session');
    }
    const pi = await this.stripeService.chargeCard(session.cart.totalAmount);
    return { client_secret: pi.client_secret, cart: session.cart };
  }
}
