import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Session,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Role } from '../auth/enums';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth(Role.CUSTOMER)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Session() session: any,
    @Request() req,
  ) {
    return this.orderService.create(createOrderDto, session, req.user);
  }

  @Get(':id')
  @Auth(Role.CUSTOMER)
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.orderService.findOne(id, req.user);
  }

  @Get()
  @Auth(Role.CUSTOMER)
  findAll() {
    return this.orderService.findAll();
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
