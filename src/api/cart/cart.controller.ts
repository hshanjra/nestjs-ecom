import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Session,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartDto } from './dto/cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  createCart(@Session() session: Record<string, any>) {
    return this.cartService.create(session);
  }

  @Post('/update')
  updateCart(@Body() dto: CartDto, @Session() session: Record<string, any>) {
    return this.cartService.update(dto, session);
  }

  @Get()
  getCart(@Session() session: Record<string, any>) {
    return this.cartService.getCartItems(session);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Session() session: Record<string, any>) {
    return this.cartService.removeItem(id, session);
  }
}
