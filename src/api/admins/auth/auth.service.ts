import { Injectable } from '@nestjs/common';
import { AdminAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  validateAdmin(dto: AdminAuthDto) {
    return dto;
  }
}
