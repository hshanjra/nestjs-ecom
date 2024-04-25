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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {}),
    AuthModule,
    UsersModule,
    ProductModule,
    OrderModule,
    CloudinaryModule,
    SellerModule,
    StripeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
