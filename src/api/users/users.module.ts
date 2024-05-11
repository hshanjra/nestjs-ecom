import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserController } from './users.controller';
import { Merchant, MerchantSchema } from 'src/schemas/merchant.schema';
import { SellerService } from '../seller/seller.service';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import {
  Order,
  OrderSchema,
  SellerOrder,
  SellerOrderSchema,
} from 'src/schemas/order.schema';
import { Shipment, ShipmentSchema } from 'src/schemas/shipment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },
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
    ]),
  ],
  controllers: [UserController],
  providers: [UsersService, SellerService],
  exports: [UsersService],
})
export class UsersModule {}
