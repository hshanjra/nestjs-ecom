import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService],
  imports: [AuthModule],
})
export class AdminsModule {}
