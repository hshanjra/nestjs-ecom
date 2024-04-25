import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true })
  categoryName: string;

  @Prop({ type: String, required: true, index: true })
  categorySlug: string;

  @Prop({ type: String })
  categoryDescription: string;

  @Prop({ type: String })
  categoryImgUrl: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  subCategory: Category;
}
export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ categorySlug: 1 }, { unique: true });
