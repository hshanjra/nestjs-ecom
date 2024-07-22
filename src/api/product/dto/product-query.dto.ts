import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ProductQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  sort?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsBooleanString()
  featured?: boolean;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  subModel?: string;

  @IsOptional()
  @IsString()
  year?: string;
}
