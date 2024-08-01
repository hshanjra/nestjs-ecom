import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ProductService } from '../product/product.service';
import {
  Order,
  OrderSchema,
  SellerOrder,
  SellerOrderSchema,
} from 'src/schemas/order.schema';
import { Shipment, ShipmentSchema } from 'src/schemas/shipment.schema';
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
        name: SellerOrder.name,
        schema: SellerOrderSchema,
      },
      {
        name: Shipment.name,
        schema: ShipmentSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [SellerController],
  providers: [ProductService, CloudinaryService],
})
export class SellerModule {}
