import { Controller, Headers, HttpCode, Post, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';

@Controller('/webhooks/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post()
  @HttpCode(200)
  // @Header('Cache-Control', 'none')
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.stripeService.handleWebhook(sig, req, res);
  }
}
