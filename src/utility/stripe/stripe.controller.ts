import {
  Controller,
  Header,
  HttpCode,
  Post,
  RawBody,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';

@Controller('/webhooks/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  async webhook(@Req() request: Request, @RawBody() body: any) {
    return await this.stripeService.handleWebhook(request, body);
  }
}
