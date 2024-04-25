import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Address {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({
    type: {
      firstName: String,
      lastName: String,
      companyName: String,
      streetAddress: String,
      phone: Number,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  billingAddress: Record<string, any>;

  @Prop({
    type: {
      firstName: String,
      lastName: String,
      companyName: String,
      streetAddress: String,
      phone: Number,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  shippingAddress: Record<string, any>;
}
