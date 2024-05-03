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
import { ProductService } from 'src/product/product.service';

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

    return session.cart;
  }

  async update(cartDto: CartDto, session: Record<string, any>) {
    const cart: ICart = session.cart || {
      items: {},
      totalQty: 0,
      subTotal: 0,
      tax: 0,
      totalAmount: 0,
      stateCode: '',
    };
    const itemId = cartDto.id;
    const itemQty = Number(cartDto.qty) || 1;
    const stateCode = cartDto.stateCode || 'FL';

    // check if product exists in the database
    const existingProduct = await this.productService.findProductById(itemId);

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

    // Update cart item
    cart.items[itemId] = {
      product: existingProduct,
      qty: adjustedQty,
    };

    // Update total quantity
    cart.totalQty += adjustedQty - prevQty;

    // Update subtotal
    const qtyDiff = adjustedQty - prevQty;
    cart.subTotal += existingProduct.salePrice * qtyDiff;

    // Calculate tax and total amount
    const tax = await this.calcTax(cart.subTotal, stateCode);
    const total = cart.subTotal + tax;

    // Update cart with tax and total amount
    cart.stateCode = stateCode;
    cart.tax = tax;
    cart.totalAmount = total;

    return (session.cart = cart);
  }

  async remove(session: Record<string, any>) {
    return await session.destroy();
  }

  /* PRIVATE METHODS */

  // Function to calculate tax for an order
  private async calcTax(
    orderTotal: number,
    stateCode: string,
  ): Promise<number> {
    // Get the tax rate by state code
    const taxData = await this.taxRateModel.findOne({ stateCode });

    if (!taxData) return 0;
    // Calculate taxable amount (order total before tax)
    const taxableAmount = orderTotal;

    // Calculate tax amount
    const taxAmount = (taxableAmount * taxData.taxRate) / 100;

    // Round tax amount to 2 decimal places (optional)
    const roundedTaxAmount = Math.round(taxAmount * 100) / 100;

    return roundedTaxAmount;
  }

  // Function to check whether entered qty is greater than qty available.

  // true if qty is greater than available qty. false if qty is less than available qty.
  private checkExessQty(enteredQty: number, availableQty: number): boolean {
    return enteredQty > availableQty;
  }
}
