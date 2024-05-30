import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthPayloadDto, SignUpDto } from './dto/auth.dto';
import { EmailDto, ResetPasswordDto, TokenDto } from './dto/reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() authPayload: AuthPayloadDto, @Res() res: Response) {
    const token = await this.authService.validateUser(authPayload);

    this.setAccessTokenCookie(res, token);

    return res.json({ accessToken: token });
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<any> {
    const token = await this.authService.signUp(signUpDto);

    this.setAccessTokenCookie(res, token);

    return res.json({ accessToken: token });
  }

  @HttpCode(HttpStatus.OK)
  @Get('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res() res: Response) {
    // Clear the accessToken cookie
    res.clearCookie('accessToken');
    return res.json({ message: 'Logged out successfully' });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return this.authService.me(req);
  }

  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(@Query() dto: TokenDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async resendVerificationEmail(@Body() dto: EmailDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  @Post('request-password-reset')
  @HttpCode(200)
  async requestPasswordReset(@Body() dto: EmailDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Query() tDto: TokenDto,
    @Body() passDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(tDto.token, passDto.newPassword);
  }

  /* PRIVATE METHODS */

  private setAccessTokenCookie(res: Response, token: string) {
    const options = {
      httpOnly: true,
      secure: true,
    };
    res.cookie('accessToken', token, options);
  }
}
