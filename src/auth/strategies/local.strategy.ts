import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { AuthPayloadDto } from '../dto/auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {
    super();
  }
  async validate(authPayload: AuthPayloadDto): Promise<any> {
    const findUser = await this.authService.validateUser(authPayload);

    const payload = {
      _id: findUser._id,
      roles: findUser.roles,
      fullName: findUser.firstName + ' ' + findUser.lastName,
    };
    return this.jwtService.signAsync(payload);
  }
}
