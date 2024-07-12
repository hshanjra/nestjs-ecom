import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from 'src/interfaces/cart';
import { CheckoutSession } from 'src/schemas/checkout-session.schema';
import { TaxRate } from 'src/schemas/tax-rate.schema';
import generateRandomString from 'src/utility/generateRandomString.util';
import { StripeService } from 'src/utility/stripe/stripe.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(CheckoutSession.name)
    private checkoutSession: Model<CheckoutSession>,
    private stripeService: StripeService,
  ) {}

  async createCheckoutSession(
    cart: ICart,
    globalSession: any,
    user: Express.User,
  ) {
    if (!cart) throw new BadRequestException('Cart is empty.');

    // Retrieve the checkout session from the current session
    const checkoutSessionId = globalSession.cs;
    let checkoutSession;

    if (!checkoutSessionId) {
      // checkoutSessionId = await this.generateUniqueSessionId();
      checkoutSession = await this.createNewCheckoutSession(cart, user);
    } else {
      checkoutSession = await this.updateCheckoutSession(
        cart,
        checkoutSessionId,
      );
    }

    const payload = {
      sessionId: checkoutSession._id,
      cart: checkoutSession.cart,
    };

    if (!globalSession.cs) {
      globalSession.cs = checkoutSession._id;
    }

    return payload;
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
    return await this.checkoutSession.findOne({ _id: sessionId });
  }

  // async updateStateCode(checkoutSessionId: string, stateCode: string) {}

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

  private async createNewCheckoutSession(cart: ICart, user: Express.User) {
    return await this.checkoutSession.create({ cart, user });
  }

  private async updateCheckoutSession(cart: ICart, sessionId: string) {
    return await this.checkoutSession.findOneAndUpdate({
      sessionId,
      cart,
    });
  }

  // Function to calculate tax for an order
  // private async calcTax(subTotal: number, stateCode: string): Promise<number> {
  //   try {
  //     // Perform a case-insensitive search for the tax rate by state code
  //     const taxData = await this.taxRateModel.findOne({
  //       stateCode: new RegExp(`^${stateCode}$`, 'i'), // Ensures exact match, case-insensitive
  //     });

  //     if (!taxData) {
  //       console.log(`No tax data found for state: ${stateCode}`);
  //       return 0;
  //     }

  //     // Calculate tax amount directly from the order total
  //     const taxAmount = (subTotal * taxData.taxRate) / 100;

  //     // Round tax amount to 2 decimal places
  //     return Math.round(taxAmount * 100) / 100;
  //   } catch (error) {
  //     console.error('Failed to calculate tax:', error);
  //     throw new HttpException('Unable to calculate tax amount.', 502);
  //   }
  // }
}
