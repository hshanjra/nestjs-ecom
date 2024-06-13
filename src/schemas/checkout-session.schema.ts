import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ICart } from 'src/interfaces/cart';

@Schema()
export class CheckoutSession extends Document {
  @Prop({ required: true, unique: true })
  sessionId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: string;

  @Prop({ type: {}, default: {} })
  cart: ICart;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: () => new Date(Date.now() + 5 * 60 * 1000) }) // default is 5 minutes
  expiresAt: Date;
}

export const CheckoutSessionSchema =
  SchemaFactory.createForClass(CheckoutSession);

CheckoutSessionSchema.index({ sessionId: 1 }, { unique: true });
