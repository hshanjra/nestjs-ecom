import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  Session,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { SessionDto } from './dto/session.dto';
import { StateCodeDto } from './dto/state-code.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create-session')
  @Auth()
  async createCheckoutSession(
    @Session() session,
    @Request() req: Express.Request,
  ) {
    return this.checkoutService.createCheckoutSession(
      session.cart,
      session,
      req.user,
    );
  }

  @Post('validate-session')
  @HttpCode(HttpStatus.OK)
  async validateCheckoutSession(@Query() dto: SessionDto, @Session() session) {
    return this.checkoutService.validateCheckoutSession(
      dto.sessionId,
      session.cart,
    );
  }

  // @Put('update-state-code')
  // async updateStateCode(@Body() dto: StateCodeDto) {
  //   return this.checkoutService.updateStateCode(dto.sessionId, dto.stateCode);
  // }
}
