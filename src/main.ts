import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MongoSessionStore } from './utility/store/mongo-session.store';
import helmet from 'helmet';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { generateKeysIfNotExist } from './keygen';

async function bootstrap() {
  // Generate JWT RSA Keys
  generateKeysIfNotExist();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });
  app.use(cookieParser());
  app.use(helmet({}));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');
  // Mongo Store
  const mongoStore = app.get(MongoSessionStore);

  // Session config
  app.use(
    session({
      name: 'sid',
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Secure in production
        maxAge: 1000 * 60 * 60 * 24,
      }, // 24 hours
      store: mongoStore,
    }),
  );

  await app.listen(3000);
}
bootstrap();
