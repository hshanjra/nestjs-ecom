import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  categoryDescription: string;

  @IsOptional()
  categoryThumb: Express.Multer.File;

  @IsString()
  @IsOptional()
  parentId?: string;

  // @IsString()
  // @IsOptional()
  // @IsNotEmpty()
  // subCategory: mongoose.Types.ObjectId;
}
