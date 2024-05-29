import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { ResendMail } from 'src/utility/resend.util';
import { TokensUtil } from 'src/utility/tokens.util';
import * as fs from 'fs';
import { join } from 'path';
import { Merchant, MerchantSchema } from 'src/schemas/merchant.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          privateKey: fs.readFileSync(join(process.cwd(), '.keys/private.pem')),
          publicKey: fs.readFileSync(join(process.cwd(), '.keys/public.pem')),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: config.get<string | number>('JWT_EXPIRY') || '1d',
          },
        };
      },
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, ResendMail, TokensUtil],
})
export class AuthModule {}
