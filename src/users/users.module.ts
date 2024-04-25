import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserController } from './users.controller';
import { Merchant, MerchantSchema } from 'src/schemas/merchant.schema';
import { SellerService } from 'src/seller/seller.service';

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
      ,
    ]),
  ],
  controllers: [UserController],
  providers: [UsersService, SellerService],
  exports: [UsersService],
})
export class UsersModule {}
