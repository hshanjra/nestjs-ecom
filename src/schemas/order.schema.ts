import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import {
  IAddress,
  IPaymentResponse,
  ITrackingInfo,
  OrderItem,
} from 'src/interfaces';
import {
  OrderStatus,
  paymentResponse,
  ShippingCarrier,
} from 'src/api/order/enums';

@Schema({ timestamps: true })
export class Order {
  _id: string;
  // customer id could be blank if user is not logged in i.e. guest checkout
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  customerId: User;

  @Prop({
    required: true,
    type: [
      {
        _id: false,
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true },
        shippingPrice: Number,
        subTotal: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
          productTitle: String,
          productSlug: String,
          productBrand: String,
          partNumber: String,
          sku: String,
        },
      },
      ,
    ],
  })
  orderItems: OrderItem[];

  @Prop({
    required: true,
    type: {
      firstName: String,
      lastName: String,
      companyName: String,
      phone: String,
      streetAddress: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  billingAddress: IAddress;

  @Prop({
    type: {
      firstName: String,
      lastName: String,
      companyName: String,
      phone: String,
      streetAddress: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  shippingAddress: IAddress;

  @Prop({ type: String })
  paymentMethod: string;

  @Prop({
    type: {
      txnId: { type: String, default: null },
      status: {
        type: String,
        enum: paymentResponse,
        default: paymentResponse.PAYMENT_OPEN,
      },
    },
  })
  paymentResponse: IPaymentResponse;

  @Prop({ type: Number, required: true, default: 0.0 })
  taxPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  shippingPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalQty: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.ORDER_PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({ type: String, default: null })
  customerIP: string;

  @Prop({ type: String })
  orderNotes: string;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
// OrderSchema.index({ customerId: 1 }, { unique: true });

/* SELLER ORDERS SCHEMA */
@Schema({ timestamps: true })
export class SellerOrder {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  orderId: Order;

  @Prop({
    type: [
      {
        name: { type: String },
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true },
        subTotal: { type: Number, required: true },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
  })
  orderItems: OrderItem[];

  @Prop({ type: Number, default: 0.0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.ORDER_PLACED,
  })
  orderStatus: OrderStatus;

  @Prop({
    type: {
      trackingNumber: Number,
      shippingCarrier: {
        type: String,
        enum: ShippingCarrier,
      },
      shippedAt: Date,
    },
  })
  trackingInfo: ITrackingInfo;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    index: true,
    required: true,
  })
  merchantId: string;
}
export const SellerOrderSchema = SchemaFactory.createForClass(SellerOrder);
SellerOrderSchema.index({ orderId: 1 }, { unique: true });
