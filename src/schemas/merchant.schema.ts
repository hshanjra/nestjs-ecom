import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

enum accountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Schema({ timestamps: true })
export class Merchant {
  /* one-to-one */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  userId: User;

  @Prop({ type: String })
  bussinessName: string;

  @Prop({ type: String })
  bussinessLicense: string;

  @Prop({ type: Date })
  bussinessLicenseExpiry: Date;

  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
  })
  bussinessAddress: Record<string, any>;

  @Prop({ type: String })
  displayName: string;

  @Prop({ type: Number, min: 1, max: 5, default: 3 })
  dispatchFreq: number; // this will for how many days seller needs to process the order.

  @Prop({ type: Number, min: 1, max: 5 })
  merchantRating: number;

  //   @Prop({ index: true, trim: true, lowercase: true })
  //   bussinessEmail: string;

  //   @Prop({ min: 10, trim: true })
  //   bussinessPhone: number;

  //   @Prop({ type: Boolean, default: false })
  //   isEmailVerified: boolean;

  //   @Prop({ type: Boolean, default: false })
  //   isPhoneVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
    default: 'ACTIVE',
  })
  accountStatus: accountStatus;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
// MerchantSchema.index({ email: 1, username: 1, phone: 1 }, { unique: true });
