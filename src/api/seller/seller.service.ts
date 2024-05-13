import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Merchant } from 'src/schemas/merchant.schema';
import { Model } from 'mongoose';
import { Shipment } from 'src/schemas/shipment.schema';
import { Order, SellerOrder } from 'src/schemas/order.schema';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { OrderStatus } from '../order/enums';
import { OrderItem } from 'src/interfaces';

@Injectable()
export class SellerService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<Merchant>,
    @InjectModel(Shipment.name) private shipmentModel: Model<Shipment>,
    @InjectModel(SellerOrder.name) private sellerOrderModel: Model<SellerOrder>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) {}

  async create(dto: CreateMerchantDto) {
    return await this.merchantModel.create(dto);
  }

  findAll() {
    return `This action returns all merchant`;
  }

  async findOne(id: any) {
    return await this.merchantModel.findOne(id);
  }

  update(id: number, updateMerchantDto: UpdateMerchantDto) {
    return `This action updates a #${id} merchant`;
  }

  remove(id: number) {
    return `This action removes a #${id} merchant`;
  }

  async splitOrder(orderId: string): Promise<boolean> {
    const order = await this.orderModel
      .aggregate([
        { $match: { orderId: orderId } },
        { $unwind: '$orderItems' },
        {
          $lookup: {
            from: 'products', // The collection name for products
            localField: 'orderItems.product.productId', // Field to match in the current collection (Order)
            foreignField: 'productId', // Field to match in the products collection
            as: 'product',
          },
        },
        { $unwind: '$product' }, // Unwind to access the product details
        {
          $addFields: { 'orderItems.productId': '$product.productId' }, // Add productId to each OrderItem
        },
        {
          $group: {
            _id: '$product.merchant', // Group by the merchant ID from the product
            orderItems: { $push: '$orderItems' },
            totalPrice: { $sum: '$orderItems.subTotal' },
            totalShippingPrice: { $first: '$totalShippingPrice' },
            totalQty: { $sum: '$orderItems.qty' },
          },
        },
      ])
      .exec();

    if (!order || order.length === 0) {
      console.log('Order not found or no order items found.');
      return false;
    }

    // Create separate orders for each merchant
    for (const merchantOrder of order) {
      const sellerOrderData = {
        orderId: orderId,
        merchantId: merchantOrder._id,
        orderItems: merchantOrder.orderItems,
        totalPrice: merchantOrder.totalPrice,
        totalShippingPrice: merchantOrder.totalShippingPrice,
        totalQty: merchantOrder.totalQty,
        orderStatus: OrderStatus.ORDER_PLACED, // Set initial order status for the seller order
      };

      // Save the seller order
      await this.sellerOrderModel.create(sellerOrderData);
      // TODO: notify the seller
    }

    return true;
  }

  async createShipment(
    orderId: string,
    user: Express.User,
    dto: CreateShipmentDto,
  ) {
    const sellerOrder = await this.sellerOrderModel.findOne({
      orderId: orderId,
    });

    if (!sellerOrder) throw new NotFoundException('Order not found.');

    // Verify the seller has the right to modify this seller order
    if (sellerOrder.merchantId.toString() !== user.merchant._id.toString())
      throw new ForbiddenException('Unautorized access.');

    const newShipment = await this.shipmentModel.create({
      orderId: sellerOrder.orderId,
      productId: dto.productId,
      orderedQty: dto.orderedQty,
      qtyInThisShipment: dto.qtyInThisShipment,
      trackingId: dto.trackingId,
      shippedThrough: dto.shippedThrough,
      shippedAt: dto.shippedAt,
    });

    // Optionally, update the seller order with shipment details or handle inventory updates here.

    return { message: 'Shipment created successfully', shipment: newShipment };
  }

  /* PRIVATE METHODS */

  /* This method takes an array of products and groups them by seller ID, returning an object where each key represents a seller ID and its corresponding value is an array of products associated with that seller. */
  private groupProductsByMerchant(
    orderItems: OrderItem[],
  ): Record<string, OrderItem[]> {
    const productsByMerchant: Record<string, OrderItem[]> = {};

    for (const orderItem of orderItems) {
      const merchantId = orderItem.product.merchant.toHexString(); // Convert ObjectId to string
      if (!productsByMerchant[merchantId]) {
        productsByMerchant[merchantId] = [];
      }
      productsByMerchant[merchantId].push(orderItem);
    }

    return productsByMerchant;
  }

  private calcTotalPrice(orderItems: OrderItem[]): number {
    let totalPrice = 0;
    let shippingPrice = 0;
    for (const orderItem of orderItems) {
      shippingPrice = orderItem.shippingPrice * orderItem.qty;
      totalPrice += orderItem.subTotal + shippingPrice;
    }
    return totalPrice;
  }
  private calcTotalShippingPrice(orderItems: OrderItem[]): number {
    let shippingPrice = 0;
    for (const orderItem of orderItems) {
      shippingPrice = orderItem.shippingPrice * orderItem.qty;
    }
    return shippingPrice;
  }
}
