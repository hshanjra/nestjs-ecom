import {
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

import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { AddPayoutMethodDto } from './dto/add-payout.dto';
import { Request } from 'express';
import { CreateProductDto } from '../product/dto/create-product.dto';
import { ProductService } from '../product/product.service';
import { UpdateProductDto } from '../product/dto/update-product.dto';
import { CancelOrderDto } from '../order/dto/cancel-order.dto';
import { ProcessOrderDto } from '../order/dto/process-order.dto';
import { Role } from '../auth/enums';
import { Auth } from '../auth/decorators/auth.decorator';
import { ImagesInterceptor } from 'src/interceptors/images.interceptor';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly productService: ProductService) {}

  /* PRODUCTS */

  @Post('products')
  @Auth(Role.SELLER)
  @UseInterceptors(FilesInterceptor('images'), ImagesInterceptor)
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const merchantId = req.user.merchant._id;

    return await this.productService.create(dto, images, merchantId);
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
  @UseInterceptors(FilesInterceptor('images'), ImagesInterceptor)
  update(
    @Param('slug') slug: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return this.productService.updateSellerProduct(
      slug,
      updateProductDto,
      req.user.merchant._id,
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

  @Post('orders/:id/create-shipment')
  async createShipment(
    @Param('id') id: string,
    @Body() dto: CreateShipmentDto,
  ) {
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
