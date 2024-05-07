import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthPayloadDto, SignUpDto } from './dto/auth.dto';
import { LocalGuard } from './guards/local.guard';
import { Role } from './enums';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  // @UseGuards(LocalGuard) // not working
  async signIn(@Body() authPayload: AuthPayloadDto, @Res() res: Response) {
    const token = await this.authService.validateUser(authPayload);

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie('accessToken', token.access_Token, options)
      .json({
        accessToken: token.access_Token,
      });
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<any> {
    const { token } = await this.authService.signUp(signUpDto);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res.status(200).cookie('accessToken', token, options).json({
      accessToken: token,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    return this.authService.me(req);
    // return req.user;
  }
}
