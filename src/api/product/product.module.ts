import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: {
        files: 15,
      },
    }),
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, CloudinaryService],
})
export class ProductModule {}
