import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Order,
  OrderSchema,
  SellerOrder,
  SellerOrderSchema,
} from 'src/schemas/order.schema';
import { TaxRate, TaxRateSchema } from 'src/schemas/tax-rate.schema';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { ProductService } from '../product/product.service';
import { StripeService } from 'src/utility/stripe/stripe.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: SellerOrder.name,
        schema: SellerOrderSchema,
      },
      {
        name: TaxRate.name,
        schema: TaxRateSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, ProductService, CloudinaryService, StripeService],
})
export class OrderModule {}
