import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({
    type: {
      itemId: {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        qty: { type: Number, default: 1 },
      },
    },
  })
  items: Record<string, any>;

  @Prop({ type: Number, required: true, default: 0.0 })
  cartSubTotal: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  tax: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  cartTotal: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
