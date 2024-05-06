import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxRate, TaxRateSchema } from 'src/schemas/tax-rate.schema';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: TaxRate.name,
        schema: TaxRateSchema,
      },
    ]),
  ],
})
export class AdminsModule {}
