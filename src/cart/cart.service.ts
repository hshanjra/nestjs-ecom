import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { Product } from 'src/schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from 'src/interfaces/cart';
import { TaxRate } from 'src/schemas/tax-rate.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(TaxRate.name) private taxRateModel: Model<TaxRate>,
  ) {}
  async getCartItems(session: Record<string, any>) {
    if (!session.cart) {
      throw new HttpException('Cart is Empty', 204);
    }
    //calc tax and total amount
    const tax = await this.calcTax(session.cart.subTotal, 'FL');
    const total = session.cart.subTotal + tax;

    session.cart.tax = tax;
    session.cart.totalAmount = total;

    return session.cart;
  }

  async update(cartDto: CartDto, session: Record<string, any>) {
    if (!session.cart) {
      session.cart = {
        items: {},
        totalQty: 0,
        subTotal: 0,
        tax: 0,
        totalAmount: 0,
      };
    }
    const cart = session.cart as ICart;

    // check if product exists in the database
    const existingProduct = await this.productModel
      .findOne({
        _id: cartDto.id,
        isActive: true,
      })
      .select('-merchantId -merchantId -isActive -isFeaturedProduct'); //TODO: repeated code here

    if (!existingProduct) throw new NotFoundException('Product not found');

    // TODO: refactor exess quantities, check after cart update
    // const exessQty = Number(cartDto.qty) > existingProduct.productStock;
    // //check product stock vs ordered quantity
    // if (exessQty)
    //   throw new BadRequestException(
    //     `Only ${existingProduct.productStock} quantity available.`,
    //   );

    if (!cart.items[cartDto.id]) {
      //check if cart has the same product
      cart.items[cartDto.id] = {
        product: existingProduct,
        qty: Number(cartDto.qty) || 1,
      };
      cart.totalQty += Number(cartDto.qty);
      cart.subTotal += existingProduct.salePrice * Number(cartDto.qty);
      delete cart.tax;
      delete cart.totalAmount;
    } else {
      cart.items[cartDto.id].qty += Number(cartDto.qty) || 1;
      cart.totalQty += Number(cartDto.qty);
      cart.subTotal += existingProduct.salePrice * Number(cartDto.qty);
      delete cart.tax;
      delete cart.totalAmount;
    }
    return session.cart;
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
}
