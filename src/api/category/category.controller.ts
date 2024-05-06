import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('categoryThumb'))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() categoryThumb: Express.Multer.File,
  ) {
    //Validating Images before Upload
    if (!categoryThumb) {
      throw new BadRequestException('Please upload at least one image.');
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedTypes.includes(categoryThumb.mimetype)) {
      throw new BadRequestException(
        'Product images must be of type JPEG, PNG, GIF, WebP.',
      );
    }

    return this.categoryService.create(createCategoryDto, categoryThumb);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
