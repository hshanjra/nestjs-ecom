import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import slugify from 'slugify';

@Schema({
  timestamps: true,
  // toJSON: { virtuals: true },
  // toObject: { virtuals: true },
})
export class Category {
  @Prop({ type: String, required: true })
  categoryName: string;

  @Prop({ type: String })
  categoryIcon: string;

  @Prop({ type: String, index: true })
  categorySlug: string;

  @Prop({ type: String })
  categoryDescription: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  parent?: Category;

  @Prop({ type: String })
  categoryThumbnail: string;

  // @Prop({
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Category',
  // })
  // subCategory: Category;
}
export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre('save', async function (next) {
  if (!this.isModified('categoryName')) return next();
  const slugBase = slugify(this.categoryName, { lower: true });
  let slug = slugBase;
  let count = 0;
  let category: Category;

  // Accessing the model via this.constructor
  const CategoryModel: mongoose.Model<Category> = this.constructor as any;
  // Check if the slug exists and create a unique one if necessary
  do {
    if (count > 0) {
      slug = `${slugBase}-${count}`;
    }
    category = await CategoryModel.findOne({ categorySlug: slug });
    count++;
  } while (category);

  this.categorySlug = slug;
  next();
});

CategorySchema.index({ categorySlug: 1 }, { unique: true });

// CategorySchema.virtual('isRoot').get(function () {
//   return !this.parent;
// });

// CategorySchema.set('toJSON', {
//   virtuals: true,
//   versionKey: false,
//   transform: (doc, ret) => {
//     delete ret._id;
//   },
// });
