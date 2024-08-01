import {
  IsArray,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productTitle: string;

  @IsString()
  @IsNotEmpty()
  productBrand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  metaTitle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  metaDescription: string;

  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsString()
  longDescription?: string;

  @IsString()
  keywords?: string;

  @IsString()
  partNumber?: string;

  @IsString()
  sku?: string;

  @IsNotEmpty()
  @IsNumberString()
  productLength: number;

  @IsNotEmpty()
  @IsNumberString()
  productWidth: number;

  @IsNotEmpty()
  @IsNumberString()
  productHeight: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsOptional()
  // subCategory: string;

  @IsNumberString()
  @IsNotEmpty()
  // @IsPositive()
  @MaxLength(100)
  @MinLength(0)
  productStock: number;

  @IsNumberString()
  @IsOptional()
  limitOrder?: number;

  @IsNumberString()
  @IsOptional()
  minimumOrderQty?: number;

  @IsNumberString()
  @IsNotEmpty()
  regularPrice: number;

  @IsNumberString()
  @IsNotEmpty()
  salePrice: number;

  @IsNumberString()
  @IsNotEmpty()
  @IsOptional()
  shippingPrice: number;

  @IsOptional()
  @IsNotEmpty()
  images: Express.Multer.File[];

  // @IsString()
  // specDocument: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['NEW', 'USED'])
  productCondition: string;

  @IsBooleanString()
  @IsOptional()
  isFeaturedProduct?: boolean;

  @IsBooleanString()
  // @IsIn(['true', 'false'])
  isActive: boolean;

  @IsBooleanString()
  @IsOptional()
  isGenericProduct?: boolean;

  @IsString()
  @IsOptional()
  compatibleMake: string;

  @IsArray()
  @IsOptional()
  compatibleModel: string[];

  @IsArray()
  @IsOptional()
  compatibleSubmodel: string[];

  @IsArray()
  @IsOptional()
  compatibleEngine: string[];

  @IsArray()
  @IsOptional()
  compatibleYear: string[];
}
