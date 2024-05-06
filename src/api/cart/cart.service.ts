import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from 'src/interfaces/cart';
import { TaxRate } from 'src/schemas/tax-rate.schema';
import { ProductService } from '../product/product.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(TaxRate.name) private taxRateModel: Model<TaxRate>,
    private productService: ProductService,
  ) {}
  async getCartItems(session: Record<string, any>) {
    if (!session.cart) {
      throw new HttpException('Cart is Empty', 204);
    }

    // // Calculate tax and total amount
    // const tax = await this.calcTax(
    //   session.cart.subTotal,
    //   session.cart.stateCode,
    // );

    // // Update total amount
    // const total = session.cart.subTotal + tax + session.cart.shippingPrice;

    // // Update cart with tax and total amount

    // session.cart.tax = tax;
    // session.cart.totalAmount = total;

    return session.cart;
  }

  async update(cartDto: CartDto, session: Record<string, any>) {
    const cart: ICart = session.cart || {
      items: {},
      totalQty: 0,
      subTotal: 0,
      tax: 0,
      shippingPrice: 0,
      totalAmount: 0,
      stateCode: '',
    };

    const itemId = cartDto.id;
    const itemQty = Number(cartDto.qty) || 1;
    const stateCode = cartDto.stateCode || 'FL';

    // check if product exists in the database
    const existingProduct =
      await this.productService.findActiveProductById(itemId);

    if (!existingProduct) throw new NotFoundException('Product not found.');

    // check if product has stock quantity
    const stock = existingProduct.productStock >= 1 ? true : false;

    if (!stock) throw new BadRequestException('Product is out of stock.');

    // Previous quantity
    const prevQty = cart.items[itemId] ? cart.items[itemId].qty : 0;

    /* Example:
            Product A =>  prevQty=2, newQty=2, difference=2-2=0
            Product B =>  prevQty=3, newQty=5, difference=3-5=-2 (-ve)
            Product C =>  prevQty=4, newQty=2, difference=4-2=2 (+ve)
        */

    // Adjust quantity based on available stock
    const adjustedQty = this.checkExessQty(
      itemQty,
      existingProduct.productStock,
    )
      ? existingProduct.productStock
      : itemQty;

    // Calculate shipping price for the current item
    const itemShippingPrice = existingProduct.shippingPrice || 0;

    // Update cart item
    cart.items[itemId] = {
      product: existingProduct,
      qty: adjustedQty,
      shippingPrice: itemShippingPrice,
    };

    // Update total quantity
    cart.totalQty += adjustedQty - prevQty;

    // Calculate subtotal
    let subtotal = 0;
    for (const itemId in cart.items) {
      const item = cart.items[itemId];
      subtotal += item.product.salePrice * item.qty;
    }

    // Update shipping price
    cart.shippingPrice = Number(existingProduct.shippingPrice);

    // Calculate tax and total amount
    const tax = await this.calcTax(subtotal, stateCode);

    // Update total amount
    const total = subtotal + tax + cart.shippingPrice;

    // Update cart with tax and total amount
    cart.subTotal = subtotal;
    cart.stateCode = stateCode;
    cart.tax = tax;
    cart.totalAmount = total;

    // Return updated cart
    return (session.cart = cart);
  }

  async removeItem(itemId: string, session: Record<string, any>) {
    if (!session.cart || !session.cart.items) {
      throw new HttpException('Cart is Empty', 204);
    }

    const cart: ICart = session.cart;
    const stateCode = session.cart.stateCode;

    // Check if the item exists in the cart
    if (!cart.items[itemId]) {
      throw new NotFoundException('Item does not exist in the cart.');
    }

    // Remove the item from the cart
    delete cart.items[itemId];

    // Recalculate total quantity, subtotal, tax, shipping price, and total amount
    let totalQty = 0;
    let subTotal = 0;
    let totalShippingPrice = 0;

    for (const key in cart.items) {
      const item = cart.items[key];
      totalQty += item.qty;
      subTotal += item.product.salePrice * item.qty;
      totalShippingPrice += item.shippingPrice * item.qty;
    }

    const tax = await this.calcTax(subTotal, stateCode);
    const totalAmount = subTotal + tax + totalShippingPrice;

    // Update cart properties
    cart.totalQty = totalQty;
    cart.subTotal = subTotal;
    cart.tax = tax;
    cart.shippingPrice = totalShippingPrice;
    cart.totalAmount = totalAmount;

    // Update session with the modified cart
    session.cart = cart;

    // Return the updated cart
    return cart;
  }

  /* PRIVATE METHODS */

  // Function to calculate tax for an order
  private async calcTax(subTotal: number, stateCode: string): Promise<number> {
    try {
      // Perform a case-insensitive search for the tax rate by state code
      const taxData = await this.taxRateModel.findOne({
        stateCode: new RegExp(`^${stateCode}$`, 'i'), // Ensures exact match, case-insensitive
      });

      if (!taxData) {
        console.log(`No tax data found for state: ${stateCode}`);
        return 0;
      }

      // Calculate tax amount directly from the order total
      const taxAmount = (subTotal * taxData.taxRate) / 100;

      // Round tax amount to 2 decimal places
      return Math.round(taxAmount * 100) / 100;
    } catch (error) {
      console.error('Failed to calculate tax:', error);
      throw new HttpException('Unable to calculate tax amount.', 502);
    }
  }

  /*   Function to check whether entered qty is greater than qty available.
  true if qty is greater than available qty. false if qty is less than available qty. */
  private checkExessQty(enteredQty: number, availableQty: number): boolean {
    return enteredQty > availableQty;
  }
}
