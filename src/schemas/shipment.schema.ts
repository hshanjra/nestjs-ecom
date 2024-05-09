import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { ShippingCarrier } from 'src/api/order/enums';

@Schema({ timestamps: true })
export class Shipment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SellerOrder',
    required: true,
  })
  sellerOrderRef: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  productRef: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  orderedQty: number;

  @Prop({ type: Number, required: true })
  qtyInThisShipment: number;

  @Prop({ type: String, required: true })
  trackingId: string;

  @Prop({ type: String, enum: ShippingCarrier, required: true })
  shippedThrough: ShippingCarrier;

  @Prop({ type: Date, required: true })
  shippedAt: Date;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
