import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

enum TaxClass {
  STANDARD = 'STANDARD',
  REDUCED = 'REDUCED',
  ZERO = 'ZERO',
}

@Schema({ timestamps: true })
export class TaxRate {
  @Prop({
    type: String,
    min: 2,
    max: 2,
    default: 'US',
  })
  countryCode: string;

  @Prop({
    type: String,
    required: true,
    min: 2,
    max: 2,
    unique: true,
  })
  stateCode: string;

  @Prop({
    type: String,
    max: 10,
  })
  postalCode: string;

  @Prop({
    type: String,
  })
  city: string;

  @Prop({ type: Number, required: true, default: 0.0, index: true })
  taxRate: number;

  @Prop({ type: String })
  taxName: string;

  @Prop({ type: String, enum: TaxClass, default: TaxClass.STANDARD })
  taxClass: string;
}
export const TaxRateSchema = SchemaFactory.createForClass(TaxRate);
TaxRateSchema.index({ stateCode: 1 }, { unique: true });
