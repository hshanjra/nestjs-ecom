import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CompatiblePartsQuery } from './dto/compatible-query.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('hot-selling')
  findHotSelling() {
    return this.productService.findHotSelling();
  }

  @Get('featured')
  findFeatured() {
    return this.productService.findFeatured();
  }

  //Compatibility Parts Filtering
  @Get('compatibility-filter')
  findComaptibleParts(@Query() query: CompatiblePartsQuery) {
    return this.productService.findCompatibleParts(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productService.findOne(slug);
  }
}
