import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import slugify from 'slugify';
import { Category } from './category.schema';
import * as crypto from 'crypto';
import {
  ICompatibility,
  IProductDimensions,
  ProductImage,
} from 'src/interfaces';

@Schema({ timestamps: true })
export class Product {
  _id: mongoose.Types.ObjectId;

  @Prop({ type: String, unique: true, maxlength: 15 })
  productId: string;

  @Prop({ type: String, required: true, maxlength: 200 })
  productTitle: string;

  @Prop({ type: String, index: true, maxlength: 200 })
  productSlug: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  productBrand: string;

  @Prop({ type: String, required: true, maxlength: 500 })
  shortDescription: string;

  @Prop({ type: String, maxlength: 1500 })
  longDescription: string;

  @Prop({ type: String, maxlength: 50 })
  keywords: string;

  @Prop({ type: String, required: true, maxlength: 50 })
  partNumber: string;

  @Prop({ type: String, maxlength: 20 })
  sku: string;

  @Prop({
    _id: false,
    required: true,
    type: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
  })
  productDimensions: IProductDimensions; // values can be entered in milimeters

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category: Category;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  })
  subCategory: Category;

  @Prop({ type: Number, required: true, default: 1 })
  productStock: number;

  @Prop({ type: Number })
  limitOrder: number; //Sold Single product only-limit purchases to 1 item per order.

  @Prop({ type: Number })
  minimumOrderQty: number; //minimum order quantity

  @Prop({ type: Number, required: true, default: 0.0 })
  regularPrice: number;

  @Prop({ type: Number, required: true, default: 0.0 })
  salePrice: number;

  @Prop({ type: Number, default: 0.0 })
  shippingPrice: number;

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
  onSale: boolean;

  @Prop({ type: Boolean, default: false })
  isUniversal: boolean;

  @Prop({ type: Number, default: 0 })
  salesCount: number;

  @Prop({ type: Number, default: 0 })
  addedToCartCount: number;

  @Prop({
    index: true,
    _id: false,
    type: {
      vehicleMake: { type: String },
      vehicleModel: [{ type: String }],
      vehicleSubmodel: [{ type: String }],
      vehicleEngine: [{ type: String }],
      vehicleYear: [{ type: Number }],
    },
  })
  compatibleWith: ICompatibility;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  })
  merchant: mongoose.Types.ObjectId;
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

// Generate unique product identifier
ProductSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  let isUnique = false;
  const length = 10;

  // Generating ids using cryptographic algorithms

  const productId = crypto
    .randomBytes(length)
    .toString('hex')
    .slice(0, length)
    .toUpperCase();

  // Example output: 'E4D1CBA2F3'

  // Accessing the model via this.constructor
  const ProductModel: mongoose.Model<Product> = this.constructor as any;

  while (!isUnique) {
    const existingProduct = await ProductModel.findOne({ productId }).exec();
    isUnique = !existingProduct;
  }

  this.productId = productId;
  next();
});
ProductSchema.index({ productSlug: 1, productId: 1 }, { unique: true });
