import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CancelOrderDto } from 'src/order/dto/cancel-order.dto';
import { ProcessOrderDto } from 'src/order/dto/process-order.dto';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { ProductService } from 'src/product/product.service';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { AddPayoutMethodDto } from './dto/add-payout.dto';
import { Request } from 'express';

@Controller('seller') //TODO: implement authorization for [seller] only.
export class SellerController {
  constructor(private readonly productService: ProductService) {}

  /* PRODUCTS */

  @Post('products')
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    //Validating Images before Upload
    if (!images || images.length === 0) {
      throw new BadRequestException('Please upload at least one image.');
    }

    for (const file of images) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/jpg',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Product images must be of type JPEG, PNG, GIF, WebP.',
        );
      }
    }
    return await this.productService.create(createProductDto, images);
  }

  @Get('products')
  findAll() {
    //get the user id from request.
    const userId = '6621547d2b57a5386df7c45e';
    return this.productService.findAllSellerProducts(userId);
  }

  @Get('products/:slug')
  findOne(@Param('slug') slug: string, @Req() req: Request) {
    // get only seller products
    return this.productService.findOne(slug);
  }

  @Patch('products/:slug')
  @UseInterceptors(FilesInterceptor('images'))
  update(
    @Param('slug') slug: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.productService.updateSellerProduct(
      slug,
      updateProductDto,
      images,
    );
  }

  @Post('products/:slug/change-status')
  async UpdateProductStatus(@Param('slug') slug: string) {
    return slug;
  }

  /* REQUESTS */

  // handle file uploads
  @Post('requests/onboard')
  @HttpCode(200)
  async onboard() {
    return 'please upload your bussiness documents.';
  }

  /* ORDERS */

  @Get('orders')
  async GetAllOrders(@Query() status: string) {
    return status;
  }

  @Get('orders/:id')
  async GetSingleOrder(@Param() id: string) {
    return id;
  }

  @Post('orders/:id/cancel')
  @HttpCode(200)
  async CancelOrder(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    const payload = {
      orderId: 'Order has been canceled ' + id,
      dto: dto,
    };
    return payload;
  }

  @Post('orders/:id/process')
  async ProcessOrder(@Param('id') id: string, @Body() dto: ProcessOrderDto) {
    const payload = {
      orderId: 'Order has been processed ' + id,
      dto: dto,
    };
    return payload;
  }

  /* FINANCES */

  @Post('finances/add-bank-account')
  async AddBankAccount(@Body() dto: AddBankAccountDto) {
    return dto;
  }

  @Post('finances/add-payout-method')
  async AddPayoutMethod(@Body() dto: AddPayoutMethodDto) {
    return dto;
  }
}
