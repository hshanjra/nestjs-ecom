import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import slugify from 'slugify';
import { Merchant } from './merchant.schema';
import { Category } from './category.schema';
import {
  ICompatibility,
  IProductDimensions,
  ProductImage,
} from 'src/interfaces';

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true, index: true })
  productTitle: string;

  @Prop({ type: String, index: true })
  productSlug: string;

  @Prop({ type: String, required: true })
  productBrand: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String })
  longDescription: string;

  @Prop({ type: String })
  keywords: string;

  @Prop({ type: String, required: true })
  partNumber: string;

  @Prop({ type: String })
  sku: string;

  @Prop({
    _id: false,
    required: true,
    type: {
      length: Number,
      width: Number,
      height: Number,
    },
  })
  productDimensions: IProductDimensions; // values can be entered in milimeters

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    // required: true, //TODO: uncomment this line
  })
  productCategory: Category;

  @Prop({ type: Number, required: true, default: 1 })
  productStock: number;

  @Prop({ type: Number, required: false })
  limitOrder: number; //Sold Single product only-limit purchases to 1 item per order.

  @Prop({ type: Number })
  minimumOrderQty: number; //minimum order quantity

  @Prop({ type: Number, required: true, default: 0.0 })
  regularPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  salePrice: number;

  @Prop({
    required: true,
    type: [
      {
        url: { type: String, required: true },
        alt: { type: String },
      },
    ],
  })
  productImages: ProductImage[];

  // @Prop({ type: String })
  // specDocument: string; //link for specification document

  @Prop({ type: String, enum: ['NEW', 'USED'], default: 'NEW', required: true })
  productCondition: string;

  @Prop({ type: Boolean, default: false })
  isFeaturedProduct: boolean;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isGenericProduct: boolean;

  @Prop({ type: Number, default: 0 })
  salesCount: number;

  @Prop({ type: Number, default: 0 })
  addedToCartCount: number;

  @Prop({
    index: true,
    _id: false,
    type: {
      vehicleMake: { type: String, required: true },
      vehicleModel: [{ type: String, required: true }],
      vehicleSubmodel: [{ type: String }],
      vehicleEngine: [{ type: String }],
      vehicleYear: [{ type: Number, required: true }],
    },
  })
  compatibleWith: ICompatibility;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  })
  merchantId: Merchant;
}
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', async function (next) {
  if (!this.isModified('productTitle')) return next();

  const slugBase = slugify(this.productTitle, { lower: true });
  let slug = slugBase;
  let count = 0;
  let product;

  // Accessing the model via this.constructor
  const ProductModel: mongoose.Model<Product> = this.constructor as any;
  // Check if the slug exists and create a unique one if necessary
  do {
    if (count > 0) {
      slug = `${slugBase}-${count}`;
    }
    product = await ProductModel.findOne({ productSlug: slug });
    count++;
  } while (product);

  this.productSlug = slug;
  next();
});

ProductSchema.index({ productSlug: 1 }, { unique: true });
