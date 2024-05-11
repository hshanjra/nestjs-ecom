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
import { SellerService } from '../seller/seller.service';
import { Merchant, MerchantSchema } from 'src/schemas/merchant.schema';
import { Shipment, ShipmentSchema } from 'src/schemas/shipment.schema';

@Module({
  imports: [
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
        name: TaxRate.name,
        schema: TaxRateSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    ProductService,
    CloudinaryService,
    StripeService,
    SellerService,
  ],
})
export class OrderModule {}
