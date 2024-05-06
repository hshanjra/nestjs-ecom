import {
  IsArray,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productTitle: string;

  @IsString()
  @IsNotEmpty()
  productBrand: string;

  @IsString()
  shortDescription?: string;

  @IsString()
  longDescription?: string;

  @IsString()
  keywords?: string;

  @IsNumberString()
  partNumber?: number;

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
  productCategory: string;

  @IsNumberString()
  @IsNotEmpty()
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
