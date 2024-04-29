import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { Product } from 'src/schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICart } from 'src/interfaces/cart';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}
  getCartItems(session: Record<string, any>) {
    if (!session.cart) {
      throw new HttpException('Cart is Empty', 204);
    }
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

    const calcTax = 10; //TODO: calculate tax amount
    if (!cart.items[cartDto.id]) {
      //check if cart has the same product
      cart.items[cartDto.id] = {
        product: existingProduct,
        qty: Number(cartDto.qty) || 1,
      };
      cart.totalQty += Number(cartDto.qty);
      cart.subTotal += existingProduct.salePrice * Number(cartDto.qty);
      cart.tax += calcTax;
      cart.totalAmount = cart.subTotal + cart.tax;
    } else {
      cart.items[cartDto.id].qty += Number(cartDto.qty) || 1;
      cart.totalQty += Number(cartDto.qty);
      cart.subTotal += existingProduct.salePrice * Number(cartDto.qty);
      cart.tax += calcTax;
      cart.totalAmount = cart.subTotal + cart.tax;
    }
    return session.cart;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
