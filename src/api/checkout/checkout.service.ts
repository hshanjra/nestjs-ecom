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

    // // Retrieve the checkout session from the current session
    // let checkoutSession;

    // Check if the session is missing or expired
    // if (!checkoutSession || new Date() > checkoutSession.expiresAt) {
    //   // Generate a new unique session ID
    //   const sessionId = await this.generateUniqueSessionId();

    //   // Create a new checkout session
    //   checkoutSession = await this.checkoutSession.create({
    //     cart: cart,
    //     sessionId: sessionId,
    //   });
    //   // Update the current session with the new checkout session
    //   session.cs = checkoutSession;
    // }
    // Generate a new unique session ID
    const sessionId = await this.generateUniqueSessionId();

    // Create a new checkout session
    const checkoutSession = await this.checkoutSession.create({
      cart: cart,
      sessionId: sessionId,
    });
    return { sessionId: checkoutSession.sessionId };
  }

  async validateCheckoutSession(sessionId: string, cart: ICart) {
    if (!cart) throw new BadRequestException('Cart not found.');
    const session = await this.checkoutSession
      .findOne({ sessionId })
      .select('cart -_id');

    if (!session || new Date() > session.expiresAt || session.isPaid) {
      throw new NotFoundException('Invalid session');
    }
    const pi = await this.stripeService.chargeCard(
      session.cart.totalAmount,
      // cart.items,
    );
    return {
      client_secret: pi.client_secret,
      intentId: pi.id,
      cart: session.cart,
    };
  }

  async getCheckoutSession(sessionId: string) {
    return await this.checkoutSession.findOne({ sessionId: sessionId });
  }

  private async generateUniqueSessionId() {
    let sessionId;
    let existingSessionId;

    do {
      sessionId = 'cs_' + generateRandomString(78);
      existingSessionId = await this.checkoutSession.findOne({
        sessionId: sessionId,
      });
    } while (existingSessionId);

    return sessionId;
  }
}
