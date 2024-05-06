import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from './order/order.module';
import { CloudinaryModule } from './utility/cloudinary/cloudinary.module';
import { SellerModule } from './seller/seller.module';
import { StripeModule } from './utility/stripe/stripe.module';
import { CategoryModule } from './category/category.module';
import { AdminsModule } from './admins/admins.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';
import { MongoSessionStore } from './utility/store/mongo-session.store';

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
