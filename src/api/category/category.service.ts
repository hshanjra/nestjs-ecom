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
    //handleFileUpload
    const thumbUrl =
      await this.cloudinaryService.uploadSingleImage(categoryThumb);

    // Create the category
    const category = await this.categoryModel.create({
      ...dto,
      categoryThumbnail: thumbUrl.url,
      parent: dto.parentId || null,
    });

    return category;
  }

  async getAllCategories(): Promise<Category[]> {
    const categories: Category[] = await this.categoryModel.find().exec();
    return this.buildCategoryHierarchy(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    return await this.categoryModel
      .findOne({ categorySlug: slug })
      .populate('parent')
      .exec();
  }

  async getCategoryById(categoryId: string): Promise<Category> {
    return this.categoryModel.findById(categoryId).populate('parent').exec();
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }

  /* PRIVATE FUNCTIONS */

  private buildCategoryHierarchy(categories: any[]): Category[] {
    const categoryMap: { [key: string]: any } = {};

    // Create a map of category IDs to categories
    categories.forEach((category) => {
      categoryMap[category._id] = { ...category.toObject(), subcategories: [] };
    });

    // Assign subcategories to their parent categories
    categories.forEach((category) => {
      if (category.parent) {
        if (categoryMap[category.parent]) {
          categoryMap[category.parent].subcategories.push(
            categoryMap[category._id],
          );
        }
      }
    });

    // Filter out categories that are not top-level categories
    const topLevelCategories = categories.filter(
      (category) => !category.parent,
    );

    // Return top-level categories with their subcategories attached
    return topLevelCategories.map((category) => categoryMap[category._id]);
  }
}
