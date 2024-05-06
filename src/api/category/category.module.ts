import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      limits: {
        files: 1,
      },
    }),
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CloudinaryService],
})
export class CategoryModule {}
