import { Module } from '@nestjs/common';
import { CloudinaryModule } from './utility/cloudinary/cloudinary.module';
import { MongoSessionStore } from './utility/store/mongo-session.store';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { ProductModule } from './api/product/product.module';
import { OrderModule } from './api/order/order.module';
import { SellerModule } from './api/seller/seller.module';
import { StripeModule } from './utility/stripe/stripe.module';
import { CategoryModule } from './api/category/category.module';
import { AdminsModule } from './api/admins/admins.module';
import { CartModule } from './api/cart/cart.module';
import { CouponsModule } from './api/coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.DATABASE_URI + '/' + process.env.DB_NAME,
      {},
    ),
    AuthModule,
    UsersModule,
    ProductModule,
    OrderModule,
    CloudinaryModule,
    SellerModule,
    StripeModule,
    CategoryModule,
    AdminsModule,
    CartModule,
    CouponsModule,
  ],
  controllers: [],
  providers: [MongoSessionStore],
})
export class AppModule {}
