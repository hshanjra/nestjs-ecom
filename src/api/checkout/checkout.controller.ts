import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Session,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { SessionDto } from './dto/session.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create-session')
  async createCheckoutSession(@Session() session) {
    return this.checkoutService.createCheckoutSession(session.cart);
  }

  @Post('validate-session')
  @HttpCode(HttpStatus.OK)
  async validateCheckoutSession(@Query() dto: SessionDto, @Session() session) {
    return this.checkoutService.validateCheckoutSession(
      dto.sessionId,
      session.cart,
    );
  }
}
