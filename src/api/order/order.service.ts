import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Order } from 'src/schemas/order.schema';
import { OrderStatus } from './enums';
import { cartItem, ICart } from 'src/interfaces/cart';
import { TaxRate } from 'src/schemas/tax-rate.schema';
import { OrderItem } from 'src/interfaces';
import { Product } from 'src/schemas/product.schema';
import { ProductService } from '../product/product.service';
import { StripeService } from 'src/utility/stripe/stripe.service';
import { SellerService } from '../seller/seller.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(TaxRate.name) private taxRateModel: Model<TaxRate>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private productService: ProductService,
    private stripeService: StripeService,
    private sellerService: SellerService,
  ) {}

  /* CUSTOMER */
  async create(dto: CreateOrderDto, session: any): Promise<Order> {
    let order: Order;

    // Start a session on the Mongoose connection
    const mongooseSession = await this.orderModel.startSession();

    mongooseSession.startTransaction();
    try {
      this.validateCart(session);

      const cart: ICart = session.cart;
      const orderItems: OrderItem[] = await this.processCartItems(cart.items);

      order = await this.createOrderRecord(dto, cart, orderItems);
      await this.updateProductStocks(orderItems);

      await mongooseSession.commitTransaction();
    } catch (error) {
      // TODO: move this into webhook
      // If payment fails, update order status to ORDER_CANCELLED and save payment details
      // await this.updateOrderStatus(
      //   order._id,
      //   OrderStatus.ORDER_CANCELLED,
      //   mongooseSession,
      // );
      await mongooseSession.abortTransaction();
      throw error;
    }

    let _pi;
    // check payment methods and generate tokens
    switch (dto.paymentMethod) {
      case 'CARD':
        // Write code to charge stripe amount
        // _pi = await this.stripeService.chargeCard(order.totalPrice);
        await this.sellerService.splitOrder(order.orderId);
        break;

      case 'PAYPAL':
        // Write code to charge paypal amount
        break;
    }

    // await this.splitOrder(order._id); // TODO: move this into a separate function where payment status is successful then split order
    this.clearCart(session);

    return _pi;
  }

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }

  /* SHARED */

  // Function to calculate tax for an order
  private async calcTax(
    orderTotal: number,
    stateCode: string,
  ): Promise<number> {
    try {
      // Perform a case-insensitive search for the tax rate by state code
      const taxData = await this.taxRateModel.findOne({
        stateCode: new RegExp(stateCode, 'i'),
      });

      if (!taxData) return 0;
      // Calculate taxable amount (order total before tax)
      const taxableAmount = orderTotal;

      // Calculate tax amount
      const taxAmount = (taxableAmount * taxData.taxRate) / 100;

      // Round tax amount to 2 decimal places (optional)
      const roundedTaxAmount = Math.round(taxAmount * 100) / 100;

      return roundedTaxAmount;
    } catch (error) {
      throw new HttpException('Unable to calculate tax amount.', 502);
    }
  }

  // Method to validate the existence of items in the cart
  private validateCart(session: any): void {
    if (!session.cart || !session.cart.items) {
      throw new BadRequestException('There is nothing in the cart.');
    }
  }

  // Method to process each item in the cart and create order items
  private async processCartItems(cartItems: {
    [id: string]: cartItem;
  }): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = [];

    for (const itemId in cartItems) {
      const cartItem = cartItems[itemId];
      const product = await this.productService.findActiveProductByProductId(
        cartItem.product.productId,
      );

      if (!product) {
        throw new NotFoundException(
          `Product '${cartItem.product.productTitle}' not found.`,
        );
      }

      if (cartItem.qty > product.productStock) {
        throw new BadRequestException(
          `Not enough stock available for the product '${cartItem.product.productTitle}'`,
        );
      }

      orderItems.push(this.createOrderItem(cartItem, product));
    }

    return orderItems;
  }

  // Method to create a single order item from a cart item
  private createOrderItem(cartItem: cartItem, product: Product): OrderItem {
    return {
      qty: cartItem.qty,
      price: product.salePrice, // Assuming salePrice is the price to be charged
      shippingPrice: cartItem.shippingPrice,
      subTotal: cartItem.qty * product.salePrice,
      product: {
        productId: product.productId,
        productTitle: product.productTitle,
        productSlug: product.productSlug,
        productBrand: product.productBrand,
        partNumber: product.partNumber,
        sku: product.sku,
        merchant: product.merchant,
      },
    };
  }

  // Method to create the order record
  private async createOrderRecord(
    dto: CreateOrderDto,
    cart: ICart,
    orderItems: OrderItem[],
  ): Promise<Order> {
    return await this.orderModel.create({
      billingAddress: dto.billingAddress,
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      orderItems: orderItems,
      taxPrice: cart.tax,
      totalShippingPrice: cart.totalShippingPrice,
      totalQty: cart.totalQty,
      totalPrice: cart.totalAmount,
    });
  }

  // Method to update the stock of each product ordered
  private async updateProductStocks(orderItems: OrderItem[]): Promise<void> {
    for (const orderItem of orderItems) {
      await this.productService.decreaseProductStock(
        orderItem.product.productId,
        orderItem.qty,
      );
    }
  }

  // Method to clear the cart after the order is created
  private clearCart(session: any): void {
    session.cart = null;
  }

  // Method to update the order status
  private async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    session: ClientSession,
  ): Promise<void> {
    await this.orderModel.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { session },
    );
  }

  // Method to store payment information
  private async savePaymentResponse(
    orderId: string,
    txnId: string,
    status: string,
    session: ClientSession,
  ): Promise<void> {
    await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        paymentResponse: {
          txnId,
          status,
        },
      },
      { session },
    );
  }
}
