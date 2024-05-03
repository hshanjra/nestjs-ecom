import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Merchant } from './merchant.schema';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/enums';

enum accountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ index: true, required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ min: 10, trim: true })
  phone: string;

  // @Prop({ type: String, required: true, unique: true, lowercase: true })
  // username: string;

  @Prop({ required: true, min: 8, trim: true })
  password: string;

  @Prop({
    type: Array,
    enum: Role,
    default: Role.CUSTOMER,
  })
  roles: Array<Role>;

  @Prop({ type: Boolean, default: false })
  isEmailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  isPhoneVerified: boolean;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
    default: 'ACTIVE',
  })
  status: accountStatus;

  /* one-to-one */
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' })
  merchantId: Merchant;

  // @Prop({ type: Boolean, default: false })
  // isMerchantVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.index({ email: 1, phone: 1 }, { unique: true });
