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
      .findById(orderId)
      .populate('orderItems.product')
      .exec();

    if (
      !order ||
      order.orderStatus === OrderStatus.ORDER_COMPLETED ||
      order.orderStatus === OrderStatus.ORDER_FAILED
    ) {
      console.log(
        'Order is already separated into sellers or order is completed.',
      );
      return false;
    }

    // Group order items by merchantId
    const productsByMerchant = this.groupProductsByMerchant(order.orderItems);

    // Create separate orders for each merchant
    for (const merchantId in productsByMerchant) {
      const products = productsByMerchant[merchantId];
      const totalPrice = this.calcTotalPrice(products);
      const totalShippingPrice = this.calcTotalShippingPrice(products);

      // Populate orderItems array for the SellerOrder
      const orderItems = products.map((product) => ({
        productRef: product.product._id, // Assuming productId is the _id of the product
        qty: product.qty,
        shippingPrice: product.shippingPrice,
        price: product.price,
        subTotal: product.subTotal, // Populate subTotal from the original order item
      }));

      const sellerOrderData = {
        orderRef: order._id,
        merchantRef: merchantId,
        orderItems,
        totalPrice,
        totalShippingPrice,
      };

      // Save the seller order
      await this.sellerOrderModel.create(sellerOrderData);
    }

    return true;
  }

  async createShipment(
    orderId: string,
    user: Express.User,
    dto: CreateShipmentDto,
  ) {
    const sellerOrder = await this.sellerOrderModel.findById(orderId);

    if (!sellerOrder) throw new NotFoundException('Order not found.');

    // Verify the seller has the right to modify this seller order
    if (sellerOrder.merchantRef.toString() !== user.merchant._id.toString())
      throw new ForbiddenException('Unautorized access.');

    const newShipment = await this.shipmentModel.create({
      sellerOrderId: sellerOrder._id,
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
