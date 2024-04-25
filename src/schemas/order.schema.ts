import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Merchant } from './merchant.schema';
import { User } from './user.schema';
import {
  IAddress,
  IPaymentResponse,
  ITrackingInfo,
  OrderItem,
} from 'src/interfaces';

enum OrderStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}
enum ShippingCarrier {
  USPS = 'USPS',
  UPS = 'UPS',
  FEDEX = 'FEDEX',
  DHL = 'DHL',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ _id: Number })
  _id: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  customerId: User;

  @Prop({
    required: true,
    type: [
      {
        name: { type: String },
        qty: { required: true, type: Number, default: 1 },
        price: { required: true, type: Number },
        tax: { required: true, type: Number, default: 0.0 },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
  })
  orderItems: OrderItem[];

  @Prop({
    required: true,
    type: [
      {
        billingAddress: {
          firstName: String,
          lastName: String,
          companyName: String,
          streetAddress: String,
          city: String,
          state: String,
          zipCode: String,
          country: String,
        },
        shippingAddress: {
          firstName: String,
          lastName: String,
          phone: Number,
          streetAddress: String,
          city: String,
          state: String,
          zipCode: String,
          country: String,
        },
      },
    ],
  })
  address: IAddress[];

  @Prop({
    type: {
      trackingNumber: Number,
      shippingCarrier: {
        enum: ShippingCarrier,
        required: true,
      },
      shippedAt: Date,
    },
  })
  trackingInfo: ITrackingInfo;

  @Prop({ type: String })
  paymentMethod: string;

  @Prop({
    required: true,
    type: {
      txnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
      status: String,
    },
  })
  paymentResponse: IPaymentResponse;

  @Prop({ type: Number, required: true, default: 0.0 })
  taxPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  shippingPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  itemsPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalPrice: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus: OrderStatus;

  @Prop({ type: String })
  orderNotes: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  })
  merchantId: Merchant;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ customerId: 1, merchantId: 1 }, { unique: true });
