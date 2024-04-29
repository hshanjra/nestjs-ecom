import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Roles } from '../enums/role.enum';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class Admin {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Array, enum: Roles, default: Roles.ADMIN })
  role: Array<Roles>;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});
AdminSchema.index({ email: 1 }, { unique: true });
