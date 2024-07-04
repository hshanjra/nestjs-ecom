import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';
import { IAddress, IPaymentResponse, OrderItem } from 'src/interfaces';
import { OrderStatus, paymentResponse } from 'src/api/order/enums';

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, unique: true })
  orderId: string;
  // customer id could be blank if user is not logged in i.e. guest checkout
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

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
          productId: String,
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
      _id: false,
      firstName: String,
      lastName: String,
      companyName: String,
      phone: String,
      streetAddress: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' },
    },
  })
  billingAddress: IAddress;

  @Prop({
    type: {
      _id: false,
      firstName: String,
      lastName: String,
      companyName: String,
      phone: String,
      streetAddress: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'US' },
    },
  })
  shippingAddress: IAddress;

  @Prop({ type: String })
  paymentMethod: string;

  @Prop({
    type: {
      _id: false,
      txnId: { type: String, default: null },
      status: {
        type: String,
        enum: paymentResponse,
        default: paymentResponse.PAYMENT_OPEN,
      },
      responseData: { type: Object, default: null },
    },
  })
  paymentResponse: IPaymentResponse;

  @Prop({ type: Number, required: true, default: 0.0 })
  taxPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  totalShippingPrice: number;

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

  @Prop({ type: String, max: 250 })
  orderNotes: string;

  @Prop({ type: Boolean, default: false })
  isPaid: boolean;

  @Prop({ type: Date, default: null })
  paidAt: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ orderId: 1 }, { unique: true });

// Genrating custom unique orderIds

OrderSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const prefix = 'BYP';

  // Accessing the model via this.constructor
  const OrderModel: mongoose.Model<Order> = this.constructor as any;
  const lastOrder = await OrderModel.findOne().sort({ createdAt: -1 }).exec();

  let orderId: string;
  if (lastOrder) {
    const lastOrderId = lastOrder.orderId;
    const lastId = parseInt(lastOrderId.replace(prefix, ''), 10);
    orderId = prefix + (lastId + 1).toString().padStart(5, '0');
  } else {
    orderId = prefix + '00001';
  }

  this.orderId = orderId;
  next();
});

/* SELLER ORDERS SCHEMA */
@Schema({ timestamps: true })
export class SellerOrder {
  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({
    type: [
      {
        _id: false,
        name: { type: String },
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true },
        shippingPrice: { type: Number },
        subTotal: { type: Number, required: true },
        productId: {
          type: String,
          required: true,
        },
      },
    ],
  })
  orderItems: OrderItem[];

  // @Prop({ type: Number, default: 0.0 })
  // shippingPrice: number;

  @Prop({ type: Number, default: 0.0, required: true })
  totalPrice: number;

  @Prop({ type: Number, default: 0.0 })
  totalShippingPrice: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.ORDER_PLACED,
  })
  orderStatus: OrderStatus;

  @Prop({ type: Boolean, default: false })
  isDelivered: boolean;

  @Prop({ type: Date, default: null })
  deliveredAt: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  })
  merchantId: mongoose.Schema.Types.ObjectId;
}
export const SellerOrderSchema = SchemaFactory.createForClass(SellerOrder);
