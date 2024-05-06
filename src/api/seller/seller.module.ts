import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ProductService } from '../product/product.service';

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
    ]),
  ],
  controllers: [SellerController],
  providers: [ProductService, CloudinaryService],
})
export class SellerModule {}
