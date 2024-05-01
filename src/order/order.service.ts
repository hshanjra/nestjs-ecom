import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { SessionData } from 'express-session';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, SellerOrder } from 'src/schemas/order.schema';
import { OrderStatus } from './enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(SellerOrder.name) private sellerOrderModel: Model<SellerOrder>,
  ) {}

  /* CUSTOMER */
  create(createOrderDto: CreateOrderDto, session: SessionData) {
    return session;
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
  calculateTax(orderTotal: number, taxRate: number): number {
    // Calculate taxable amount (order total before tax)
    const taxableAmount = orderTotal;

    // Calculate tax amount
    const taxAmount = taxableAmount * taxRate;

    // Round tax amount to 2 decimal places (optional)
    const roundedTaxAmount = Math.round(taxAmount * 100) / 100;

    return roundedTaxAmount;
  }

  /* SELLER*/

  async splitOrder(orderId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      orderStatus: {
        $nin: [
          OrderStatus.ORDER_COMPLETED,
          OrderStatus.ORDER_FAILED,
          OrderStatus.ORDER_PENDING,
        ],
      },
    });

    if (!order) {
      console.log(
        '\nOrder is already separated into sellers or order is completed.',
      );
      return;
    }
    // Group products by seller
    const productsBySeller = this.groupProductsBySeller(order.orderItems);

    // Create separate orders for each seller
    for (const sellerId in productsBySeller) {
      const products = productsBySeller[sellerId];
      const totalPrice = this.calcTotalPrice(products);
      const sellerOrderData = {
        orderId: order._id,
        merchantId: sellerId,
        orderItems: products,
        totalPrice,
      };
      //Saving all the seller orders
      await this.sellerOrderModel.create(sellerOrderData);
    }
    return true;
  }
  /* This method takes an array of products and groups them by seller ID, returning an object where each key represents a seller ID and its corresponding value is an array of products associated with that seller. */
  private groupProductsBySeller(products: any[]): {
    [sellerId: string]: any[];
  } {
    const productsBySeller: { [sellerId: string]: any[] } = {};
    products.forEach((product) => {
      const sellerId = product.merchantId;
      if (!productsBySeller[sellerId]) {
        productsBySeller[sellerId] = [];
      }
      productsBySeller[sellerId].push(product);
    });
    return productsBySeller;
  }

  private calcTotalPrice(products: any[]): number {
    return products.reduce((total, product) => total + product.totalPrice, 0);
  }
}
