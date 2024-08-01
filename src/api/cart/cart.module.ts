import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { TaxRate, TaxRateSchema } from 'src/schemas/tax-rate.schema';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { ProductService } from '../product/product.service';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: TaxRate.name,
        schema: TaxRateSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, ProductService, CloudinaryService],
})
export class CartModule {}
