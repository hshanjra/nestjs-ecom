import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/category.schema';
import { CloudinaryService } from 'src/utility/cloudinary/cloudinary.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateCategoryDto, categoryThumb: Express.Multer.File) {
    const { subCategory, ...categoryData } = dto;

    //handleFileUpload
    const thumbUrl =
      await this.cloudinaryService.uploadSingleImage(categoryThumb);

    // Create the category
    const createdCategory = await this.categoryModel.create({
      ...categoryData,
      categoryThumbnail: thumbUrl.url,
    });

    if (subCategory) {
      const subcat = await this.categoryModel.findById(subCategory);

      if (subcat)
        await this.categoryModel.findByIdAndUpdate(subcat._id, {
          parent: createdCategory._id,
        });
    }

    return createdCategory;
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
