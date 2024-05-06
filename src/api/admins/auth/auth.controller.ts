import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminAuthDto } from './dto/auth.dto';

@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //TODO: implement rate limit for admin
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: AdminAuthDto) {
    return this.authService.validateAdmin(dto);
  }
}
